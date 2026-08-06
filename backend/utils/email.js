const dotenv = require("dotenv");

dotenv.config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const sendEmailViaBrevo = async (payload) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("Brevo API Key is missing. Please set BREVO_API_KEY in your environment.");
    return;
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
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to send email via Brevo:", error);
    throw error;
  }
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const payload = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || "Evenza",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: userEmail,
          name: userName,
        },
      ],
      subject: `Booking Confirmed: ${eventTitle}`,
      htmlContent: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing Evenza.</p>
      `,
    };
    
    await sendEmailViaBrevo(payload);
    console.log("Email sent successfully to", userEmail);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendOTPEmail = async (userEmail, otp, type) => {
  try {
    const title =
      type === "account_verification"
        ? "Verify your Evenza Account"
        : "Evenza Booking Verification";
    const msg =
      type === "account_verification"
        ? "Please use the following OTP to verify your new Evenza account."
        : "Please use the following OTP to verify and confirm your event booking.";

    const payload = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || "Evenza",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: userEmail,
        },
      ],
      subject: title,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2 style="color: #111;">${title}</h2>
            <p style="color: #555; font-size: 16px;">${msg}</p>
            <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                ${otp}
            </div>
            <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await sendEmailViaBrevo(payload);
    console.log(`OTP sent to ${userEmail} for ${type}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

module.exports = { sendBookingEmail, sendOTPEmail };
