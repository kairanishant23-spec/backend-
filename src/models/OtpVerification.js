const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    otp: { type: String, required: true }, // Single 4-digit OTP sent to both email and phone
    expiresAt: { type: Date, required: true },
    purpose: { type: String, enum: ["signup", "login"], default: "signup" }
  },
  { timestamps: true }
);

// Automatically delete document after 10 minutes (600 seconds)
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// OTP sending is handled directly in the route after create() — no hook needed.
// The old post-save hook was silently swallowing errors so the user never got OTP
// and the route still responded "success". Removed to fix this.

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);
