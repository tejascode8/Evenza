const dotenv = require("dotenv");

dotenv.config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const sendEmailViaBrevo = async (payload) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[EVENZA EMAIL WARNING] Brevo API Key is missing. Email skipped.");
    return false;
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[EVENZA EMAIL WARNING] Brevo API responded with status ${response.status}: ${errorText}`);
      return false;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("[EVENZA EMAIL WARNING] Failed to connect to Brevo:", error.message || error);
    return false;
  }
};

const sendBookingEmail = async (userEmail, userName, eventTitle, eventDetails = {}) => {
  try {
    console.log(`[EVENZA EMAIL] Dispatching booking confirmation email to ${userEmail} for "${eventTitle}"`);
    const payload = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || "Evenza",
        email: process.env.BREVO_SENDER_EMAIL || "notifications@evenza.com",
      },
      to: [
        {
          email: userEmail,
          name: userName || "Attendee",
        },
      ],
      subject: `Booking Confirmed: ${eventTitle} - Evenza`,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
          <div style="background-color: #090d16; padding: 32px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">EVENZA</h1>
            <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Official Pass Confirmation</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
              <span style="font-size: 20px; font-weight: 700; color: #065f46;">Booking Confirmed</span>
              <p style="margin: 4px 0 0; font-size: 13px; color: #047857;">Your digital pass is verified and ready for entry.</p>
            </div>

            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #334155;">
              Hi <strong>${userName || "Attendee"}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px; color: #475569;">
              Great news! Your booking for <strong>${eventTitle}</strong> has been successfully confirmed.
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;">Event Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; width: 35%;">Experience:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${eventTitle}</td>
                </tr>
                ${eventDetails.date ? `
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Schedule:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${new Date(eventDetails.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>` : ''}
                ${eventDetails.location ? `
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Venue:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${eventDetails.location}</td>
                </tr>` : ''}
                ${eventDetails.bookingId ? `
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Pass ID:</td>
                  <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #0f172a;">#${eventDetails.bookingId.toString().slice(-8).toUpperCase()}</td>
                </tr>` : ''}
              </table>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 24px;">
              You can access your digital QR pass anytime by signing in to your Attendee Dashboard.
            </p>
          </div>

          <div style="background-color: #f1f5f9; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 4px;">&copy; 2026 Evenza Inc. All rights reserved.</p>
            <p style="margin: 0;">256-bit Encrypted Platform &bull; High-Security Verification</p>
          </div>
        </div>
      `,
    };
    
    await sendEmailViaBrevo(payload);
    return true;
  } catch (error) {
    console.warn("[EVENZA EMAIL WARNING] Error sending confirmation email:", error.message || error);
    return false;
  }
};

const sendBookingSubmissionEmail = async (userEmail, userName, eventTitle) => {
  try {
    const payload = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || "Evenza",
        email: process.env.BREVO_SENDER_EMAIL || "notifications@evenza.com",
      },
      to: [
        {
          email: userEmail,
          name: userName || "Attendee",
        },
      ],
      subject: `Booking Request Received: ${eventTitle} - Evenza`,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
          <div style="background-color: #090d16; padding: 32px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">EVENZA</h1>
            <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Booking Verification Acknowledged</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #334155;">
              Hi <strong>${userName || "Attendee"}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px; color: #475569;">
              Your 2FA OTP verification was successful, and your reservation request for <strong>${eventTitle}</strong> has been submitted.
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px; color: #475569;">
              Your pass request is currently being reviewed. You will receive a notification once confirmed. You can also view your live status on your Attendee Dashboard.
            </div>
          </div>

          <div style="background-color: #f1f5f9; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 4px;">&copy; 2026 Evenza Inc. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await sendEmailViaBrevo(payload);
    return true;
  } catch (error) {
    console.warn("[EVENZA EMAIL WARNING] Error sending booking submission email:", error.message || error);
    return false;
  }
};

const sendOTPEmail = async (userEmail, otp, type) => {
  // Always log OTP to server console for guaranteed visibility in development/testing
  console.log(`\n==================================================`);
  console.log(`[EVENZA 2FA OTP DISPATCH]`);
  console.log(`Target Email : ${userEmail}`);
  console.log(`Action Type  : ${type}`);
  console.log(`>>> OTP CODE : ${otp} <<<`);
  console.log(`Valid for    : 5 Minutes`);
  console.log(`==================================================\n`);

  try {
    const isAccount = type === "account_verification";
    const title = isAccount
      ? "Verify your Evenza Account"
      : "Evenza Booking 2FA Verification";
    const msg = isAccount
      ? "Please use the following 6-digit verification code to activate your Evenza account."
      : "Please use the following 6-digit verification code to confirm your event ticket reservation.";

    const payload = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || "Evenza",
        email: process.env.BREVO_SENDER_EMAIL || "notifications@evenza.com",
      },
      to: [
        {
          email: userEmail,
        },
      ],
      subject: `${isAccount ? 'Account Verification' : 'Booking Verification'} Code: ${otp}`,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
          <div style="background-color: #090d16; padding: 28px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">EVENZA</h1>
            <p style="margin: 6px 0 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Secure 2FA Authentication</p>
          </div>

          <div style="padding: 32px 24px; text-align: center;">
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 10px;">${title}</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 24px;">${msg}</p>
            
            <div style="margin: 0 auto 24px; padding: 18px 24px; font-size: 32px; font-family: 'Courier New', Courier, monospace; font-weight: 800; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; width: max-content; letter-spacing: 8px; color: #0f172a;">
              ${otp}
            </div>

            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              This verification code will expire in <strong>5 minutes</strong>. If you did not request this code, please ignore this email.
            </p>
          </div>

          <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            &copy; 2026 Evenza Platform &bull; 256-Bit TLS Security
          </div>
        </div>
      `,
    };

    await sendEmailViaBrevo(payload);
    return true;
  } catch (error) {
    console.warn(`[EVENZA EMAIL WARNING] Brevo delivery failed for ${userEmail}:`, error.message || error);
    // Return true because the OTP is successfully stored in MongoDB and printed in console
    return true;
  }
};

module.exports = { sendBookingEmail, sendBookingSubmissionEmail, sendOTPEmail };


