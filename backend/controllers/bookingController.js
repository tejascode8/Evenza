const Booking = require('../models/Booking');
const Event = require('../models/Event');
const OTP = require('../models/OTP');
const { sendBookingEmail, sendBookingSubmissionEmail, sendOTPEmail } = require('../utils/email');
const { broadcast } = require('../utils/realtime');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendBookingOTP = async (req, res) => {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: 'User email not found. Please sign in again.' });
        }

        const userEmail = req.user.email.toLowerCase().trim();
        const otp = generateOTP();

        await OTP.deleteMany({ email: userEmail, action: 'event_booking' });
        await OTP.create({ email: userEmail, otp, action: 'event_booking' });
        await sendOTPEmail(userEmail, otp, 'event_booking');

        res.json({ message: `A 6-digit verification code has been sent to ${userEmail}` });
    } catch (error) {
        console.error('Error in sendBookingOTP:', error);
        res.status(500).json({ message: error.message || 'Error sending verification code. Please try again.' });
    }
};

exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;
        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required.' });
        }

        const cleanOtp = String(otp || '').trim();
        if (!cleanOtp || cleanOtp.length !== 6) {
            return res.status(400).json({ message: 'Please enter a valid 6-digit verification code.' });
        }

        const userEmail = req.user.email.toLowerCase().trim();

        // Verify OTP explicitly before proceeding
        const validOTP = await OTP.findOne({ email: userEmail, otp: cleanOtp, action: 'event_booking' });
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired verification code. Please request a new code.' });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available for this event.' });

        const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });
        if (existingBooking && existingBooking.status !== 'cancelled') {
            return res.status(400).json({ message: 'You already have an active booking or pending request for this event.' });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        });

        // Populate booking data for real-time live push
        const populatedBooking = await Booking.findById(booking._id)
            .populate('eventId')
            .populate('userId', 'name email');

        // Broadcast real-time event to Admin & attendee streams
        broadcast('BOOKING_CREATED', {
            booking: populatedBooking,
            eventId: event._id,
            availableSeats: event.availableSeats,
            userId: req.user.id
        });

        // Cleanup OTP after successful verification
        await OTP.deleteMany({ email: userEmail, action: 'event_booking' });

        // Send submission acknowledgement email
        sendBookingSubmissionEmail(userEmail, req.user.name, event.title).catch(err => {
            console.error('Non-critical: Failed to send submission email', err);
        });

        res.status(201).json({
            message: 'Booking request submitted successfully! Your pass is pending confirmation.',
            booking: populatedBooking
        });
    } catch (error) {
        console.error('Error in bookEvent:', error);
        res.status(500).json({ message: 'Server Error during booking verification', error: error.message });
    }
};

exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body; // 'paid' or 'not_paid'
        const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status === 'confirmed') return res.status(400).json({ message: 'Booking is already confirmed' });

        if (!booking.eventId) {
            return res.status(404).json({ message: 'Associated event not found' });
        }

        const event = await Event.findById(booking.eventId._id || booking.eventId);
        if (!event) {
            return res.status(404).json({ message: 'Associated event not found' });
        }

        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available to confirm this booking' });
        }

        booking.status = 'confirmed';
        if (booking.amount === 0 || event.ticketPrice === 0) {
            booking.paymentStatus = 'paid';
        } else if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }
        await booking.save();

        event.availableSeats = Math.max(0, event.availableSeats - 1);
        await event.save();

        // Broadcast real-time confirmation to all clients (User dashboard, Admin dashboard, Home, EventDetail)
        broadcast('BOOKING_CONFIRMED', {
            booking,
            eventId: event._id,
            availableSeats: event.availableSeats,
            userId: booking.userId?._id || booking.userId
        });

        // Send rich email on admin confirmation
        if (booking.userId && booking.userId.email && booking.eventId) {
            await sendBookingEmail(
                booking.userId.email,
                booking.userId.name,
                booking.eventId.title,
                {
                    date: booking.eventId.date,
                    location: booking.eventId.location,
                    bookingId: booking._id
                }
            );
        }

        res.json({ message: 'Booking confirmed successfully', booking });
    } catch (error) {
        console.error('Error in confirmBooking:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        const wasConfirmed = booking.status === 'confirmed';

        booking.status = 'cancelled';
        await booking.save();

        let updatedEvent = null;
        // Only restore the seat if it was actually confirmed and deducted
        if (wasConfirmed && booking.eventId) {
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.availableSeats = Math.min(event.totalSeats, event.availableSeats + 1);
                await event.save();
                updatedEvent = event;
            }
        }

        // Broadcast real-time cancellation to all clients
        broadcast('BOOKING_CANCELLED', {
            bookingId: booking._id,
            eventId: booking.eventId,
            availableSeats: updatedEvent ? updatedEvent.availableSeats : undefined,
            userId: booking.userId
        });

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Error in cancelBooking:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


