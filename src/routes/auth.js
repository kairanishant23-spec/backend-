const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { User, OtpVerification, OtpLimiter } = require("../models");
const { auth } = require("../middleware/auth");
const { sendSignupOTP, sendLoginOTP } = require("../utils/notifications");

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "super_secret_himsaru_dev_key", { expiresIn: "30d" });
};

// Helper to generate 4-digit numeric OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Ensures 4 digits
};

// Helper to validate and clean 10-digit Indian phone number
const cleanPhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, "");
  // If it starts with 91 and has 12 digits, strip the 91
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.substring(2);
  }
  return digits;
};

// Helper to check and update OTP rate limit for email and phone number
const checkAndUpdateOtpLimit = async (email, phone) => {
  const identifiers = [];
  if (email) identifiers.push(email.toLowerCase().trim());
  if (phone) identifiers.push(phone.trim());

  if (identifiers.length === 0) {
    return { allowed: true };
  }

  const now = Date.now();
  const oneMinuteMs = 60 * 1000;
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;

  // 1. Fetch limit records for all identifiers
  const limits = await OtpLimiter.find({ identifier: { $in: identifiers } });

  // 2. Check 1-minute restriction and 24-hour daily limit of 4 OTPs
  for (const limit of limits) {
    // Filter attempts to only keep those within the last 24 hours
    const recentAttempts = limit.attempts.filter(
      (time) => now - time.getTime() < twentyFourHoursMs
    );

    // If there is any recent attempt
    if (recentAttempts.length > 0) {
      // Get the most recent attempt
      const lastAttempt = recentAttempts[recentAttempts.length - 1];
      const timeSinceLast = now - lastAttempt.getTime();

      // Check if it's less than 1 minute
      if (timeSinceLast < oneMinuteMs) {
        const secondsRemaining = Math.ceil((oneMinuteMs - timeSinceLast) / 1000);
        return {
          allowed: false,
          message: `Please wait ${secondsRemaining} seconds before requesting another OTP.`
        };
      }

      // Check if they reached the daily limit of 4
      if (recentAttempts.length >= 4) {
        // Find when the oldest of the 4 recent attempts was made
        const oldestRecentAttempt = recentAttempts[0];
        const timeUntilReset = twentyFourHoursMs - (now - oldestRecentAttempt.getTime());

        const hours = Math.floor(timeUntilReset / (60 * 60 * 1000));
        const minutes = Math.ceil((timeUntilReset % (60 * 60 * 1000)) / (60 * 1000));

        let resetMsg = "";
        if (hours > 0) {
          resetMsg = `${hours} hours and ${minutes} minutes`;
        } else {
          resetMsg = `${minutes} minutes`;
        }

        return {
          allowed: false,
          message: `OTP limit reached (max 4 per 24 hours). Please try again in ${resetMsg}.`
        };
      }
    }
  }

  // 3. If allowed, update the attempts for all identifiers
  for (const id of identifiers) {
    let limit = limits.find((l) => l.identifier === id);
    if (!limit) {
      limit = new OtpLimiter({ identifier: id, attempts: [] });
    }

    // Clean old attempts (older than 24 hours) to keep DB small
    limit.attempts = limit.attempts.filter(
      (time) => now - time.getTime() < twentyFourHoursMs
    );

    // Add current attempt
    limit.attempts.push(new Date(now));
    await limit.save();
  }

  return { allowed: true };
};

// @route   POST /api/auth/signup-otp
// @desc    Request OTP for registering a new user
// @access  Public
router.post(
  "/signup-otp",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").optional().trim(),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone is required")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array().map(e => e.msg).join(", ") });
      }

      const { firstName, lastName, email, phone } = req.body;

      // Validate 10 digit phone number
      const cleanedPhone = cleanPhoneNumber(phone);
      if (cleanedPhone.length !== 10) {
        return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits." });
      }

      // Check if user already exists
      const existingUserEmail = await User.findOne({ email });
      if (existingUserEmail) {
        return res.status(400).json({ success: false, message: "User already exists with this email." });
      }

      const existingUserPhone = await User.findOne({ phone: cleanedPhone });
      if (existingUserPhone) {
        return res.status(400).json({ success: false, message: "User already exists with this phone number." });
      }

      // Check limits (1-minute resend restriction & 4 OTPs per 24 hours)
      const limitCheck = await checkAndUpdateOtpLimit(email, cleanedPhone);
      if (!limitCheck.allowed) {
        return res.status(429).json({ success: false, message: limitCheck.message });
      }

      // Generate single 4-digit OTP (same for both email and phone)
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

      // Save verification entry
      await OtpVerification.findOneAndDelete({ $or: [{ email }, { phone: cleanedPhone }] });
      await OtpVerification.create({
        email,
        phone: cleanedPhone,
        otp,
        expiresAt,
        purpose: "signup"
      });

      // Send OTP directly so errors are visible in logs
      console.log(`📤 [Signup OTP] Sending to email: ${email} | phone: ${cleanedPhone}`);
      let delivery = null;
      try {
        delivery = await sendSignupOTP(email, cleanedPhone, otp);
      } catch (sendErr) {
        console.error("❌ [Signup OTP] Delivery error:", sendErr.message);
        delivery = { success: false, error: sendErr.message };
      }

      res.json({
        success: true,
        message: "OTP sent to your email and phone. Please check both.",
        delivery
      });
    } catch (err) {
      console.error("Signup OTP error:", err);
      res.status(500).json({ success: false, message: "Server error sending signup OTP." });
    }
  }
);

// @route   POST /api/auth/register
// @desc    Verify OTP and register new user
// @access  Public
router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").optional().trim(),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("otp").trim().notEmpty().withMessage("OTP is required")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array().map(e => e.msg).join(", ") });
      }

      const { firstName, lastName, email, phone, otp } = req.body;
      const cleanedPhone = cleanPhoneNumber(phone);

      // Verify OTP in verification table
      const otpRecord = await OtpVerification.findOne({ email, phone: cleanedPhone, purpose: "signup" });
      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: "OTP expired or invalid. Please request a new OTP." });
      }

      if (otpRecord.otp !== otp) {
        return res.status(400).json({ success: false, message: "Incorrect OTP. Please check and try again." });
      }

      // Check again to avoid race conditions
      const existingUser = await User.findOne({ $or: [{ email }, { phone: cleanedPhone }] });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "User already registered." });
      }

      // Create new user
      const user = await User.create({
        firstName,
        lastName: lastName || "",
        email,
        phone: cleanedPhone
      });

      // Clear the OTP verification entry
      await OtpVerification.findByIdAndDelete(otpRecord._id);

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses || []
        }
      });
    } catch (err) {
      console.error("Register verification error:", err);
      res.status(500).json({ success: false, message: "Server error during registration." });
    }
  }
);

// @route   POST /api/auth/login-otp
// @desc    Request login OTP
// @access  Public
router.post(
  "/login-otp",
  [
    body("phone").trim().notEmpty().withMessage("Phone is required")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array().map(e => e.msg).join(", ") });
      }

      const { phone } = req.body;
      const cleanedPhone = cleanPhoneNumber(phone);

      if (cleanedPhone.length !== 10) {
        return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits." });
      }

      // Check if user exists
      const user = await User.findOne({ phone: cleanedPhone });
      if (!user) {
        return res.status(404).json({ success: false, message: "No account found with this phone number. Please sign up first." });
      }

      // Check limits (1-minute resend restriction & 4 OTPs per 24 hours)
      const limitCheck = await checkAndUpdateOtpLimit(user.email, cleanedPhone);
      if (!limitCheck.allowed) {
        return res.status(429).json({ success: false, message: limitCheck.message });
      }

      // Generate 4-digit login OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

      // Save verification entry
      await OtpVerification.findOneAndDelete({ $or: [{ email: user.email }, { phone: cleanedPhone }] });
      await OtpVerification.create({
        email: user.email,
        phone: cleanedPhone,
        otp,
        expiresAt,
        purpose: "login"
      });

      // Send OTP directly so errors are visible in logs
      console.log(`📤 [Login OTP] Sending to phone: ${cleanedPhone} | email: ${user.email}`);
      let delivery = null;
      try {
        delivery = await sendLoginOTP(cleanedPhone, user.email, otp);
      } catch (sendErr) {
        console.error("❌ [Login OTP] Delivery error:", sendErr.message);
        delivery = { success: false, error: sendErr.message };
      }

      res.json({
        success: true,
        message: "OTP sent to your phone and email. Please check both.",
        delivery
      });
    } catch (err) {
      console.error("Login OTP request error:", err);
      res.status(500).json({ success: false, message: "Server error sending login OTP." });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Verify login OTP and sign in
// @access  Public
router.post(
  "/login",
  [
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("otp").trim().notEmpty().withMessage("OTP is required")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array().map(e => e.msg).join(", ") });
      }

      const { phone, otp } = req.body;
      const cleanedPhone = cleanPhoneNumber(phone);

      const user = await User.findOne({ phone: cleanedPhone });
      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid credentials." });
      }

      // Verify OTP using OtpVerification model (consistent with register/signup)
      const otpRecord = await OtpVerification.findOne({ phone: cleanedPhone, purpose: "login" });
      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP. Please request a new OTP." });
      }

      if (String(otpRecord.otp) !== String(otp)) {
        return res.status(400).json({ success: false, message: "Incorrect OTP. Please check and try again." });
      }

      // Clear/delete the OTP verification record
      await OtpVerification.findByIdAndDelete(otpRecord._id);

      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses || []
        }
      });
    } catch (err) {
      console.error("Login verification error:", err);
      res.status(500).json({ success: false, message: "Server error during login." });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        addresses: req.user.addresses || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   PUT /api/auth/address
// @desc    Add address
// @access  Private
router.put("/address", auth, async (req, res) => {
  try {
    const { name, phone, line1, line2, city, state, pincode, email, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({ name, phone, line1, line2, city, state, pincode, email, isDefault });
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
});

module.exports = router;
