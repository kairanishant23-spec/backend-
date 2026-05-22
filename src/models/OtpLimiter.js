const mongoose = require("mongoose");

const otpLimiterSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, unique: true, lowercase: true, trim: true },
    attempts: [{ type: Date, required: true }] // Timestamps of OTP requests/resends
  },
  { timestamps: true }
);

module.exports = mongoose.model("OtpLimiter", otpLimiterSchema);
