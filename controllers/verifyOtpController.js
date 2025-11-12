// // POST /api/otp/verify

// // import Otp from "../models/Otp.js";
// import twilio from "twilio";
// import dotenv from "dotenv";

// dotenv.config();

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// export const verifyOtp = async (req, res) => {
//   const { phone, otp } = req.body; // code = OTP entered by user

//   if (!phone || !otp) {
//     return res.status(400).json({ success: false, message: "Phone and OTP are required" });
//   }

//   try {
//     // 1️⃣ Verify using Twilio Verify API
//     const verificationCheck = await client.verify.services(process.env.TWILIO_VERIFY_SID)
//       .verificationChecks
//       .create({ to: phone, code : otp });

//     if (verificationCheck.status === "approved") {
//       return res.status(200).json({ success: true, message: "OTP verified successfully" });
//     } else {
//       return res.status(400).json({ success: false, message: "Invalid OTP" });
//     }
//   } catch (error) {
//     console.error("Twilio OTP verify error:", error);
//     return res.status(500).json({ success: false, message: "OTP verification failed", error: error.message });
//   }
// };
