const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String }, // Made optional for passwordless OTP login
    otp: { type: String },
    otpExpires: { type: Date },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    addresses: [
      {
        name: String,
        phone: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String,
        email: String,
        isDefault: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
