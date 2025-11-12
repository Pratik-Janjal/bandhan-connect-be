import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// POST /api/send-otp
export const sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone)
    return res.status(400).json({ success: false, message: "Phone number required" });

  try {
    const verification = await client.verify.services(process.env.TWILIO_VERIFY_SID)
      .verifications
      .create({
        to: phone, // "+917600543725"
        channel: "sms", // or "call" for voice OTP
      });

    console.log("Twilio Verification SID:", verification.sid);

    res.status(200).json({ success: true, message: "OTP sent via Twilio" });
  } catch (error) {
    console.error("Twilio OTP error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};
