const express = require("express");
const { body, validationResult } = require("express-validator");
const { Contact } = require("../models");

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("message").trim().notEmpty().withMessage("Message is required")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, phone, subject, message, type, businessName, city, state } = req.body;

      const contact = await Contact.create({
        name,
        email,
        phone,
        subject,
        message,
        type: type || "contact",
        businessName,
        city,
        state
      });

      res.status(201).json({
        success: true,
        message: "Thank you! We will get back to you within 24 hours.",
        contactId: contact._id
      });
    } catch (err) {
      console.error("Contact error:", err);
      res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
  }
);

// @route   POST /api/contact/distributor
// @desc    Submit distributor inquiry
// @access  Public
router.post(
  "/distributor",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("businessName").trim().notEmpty().withMessage("Business name is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("state").trim().notEmpty().withMessage("State is required"),
    body("message").trim().notEmpty().withMessage("Message is required")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, phone, businessName, city, state, message } = req.body;

      const contact = await Contact.create({
        name,
        email,
        phone,
        businessName,
        city,
        state,
        message,
        type: "distributor"
      });

      res.status(201).json({
        success: true,
        message: "Thank you for your interest! Our team will contact you within 48 hours.",
        contactId: contact._id
      });
    } catch (err) {
      console.error("Distributor error:", err);
      res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
  }
);

module.exports = router;
