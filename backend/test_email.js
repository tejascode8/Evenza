const { sendOTPEmail, sendBookingEmail } = require('./utils/email');

const testEmail = async () => {
  console.log("Starting Brevo integration test...");
  
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === "your_brevo_api_key_here") {
    console.error("\n[Error] Please configure your actual BREVO_API_KEY in backend/.env before running this test.");
    process.exit(1);
  }

  const recipient = process.argv[2] || process.env.BREVO_SENDER_EMAIL;
  if (!recipient) {
    console.error("\n[Error] Please provide a recipient email address as an argument, e.g.: node test_email.js recipient@example.com");
    process.exit(1);
  }

  console.log(`Sending verification OTP email to: ${recipient}`);
  await sendOTPEmail(recipient, "123456", "account_verification");

  console.log(`Sending booking confirmation email to: ${recipient}`);
  await sendBookingEmail(recipient, "Test User", "Introduction to Web Development");

  console.log("\nTest completed. Check your inbox and the logs above to see if it worked!");
};

testEmail();
