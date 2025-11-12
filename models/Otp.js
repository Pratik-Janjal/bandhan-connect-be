import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Otp', otpSchema);
