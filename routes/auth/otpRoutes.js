import express from "express";
import { sendOtp } from "../../controllers/otpController.js";
import { verifyOtp } from "../../controllers/verifyOtpController.js";

const otpRoutes = express.Router();

otpRoutes.post("/send-otp", sendOtp);
otpRoutes.post("/verify-otp", verifyOtp);

export default otpRoutes;
