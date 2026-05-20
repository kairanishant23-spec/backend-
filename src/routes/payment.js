const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { auth } = require("../middleware/auth");
const router = express.Router();

/* POST /api/payment/create-order — Razorpay order */
router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    if (!amount || !orderId) return res.status(400).json({ error: "Amount and orderId required." });

    // In production, we'd use Razorpay SDK. Let's load keys if available:
    if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes("placeholder")) {
      const Razorpay = require("razorpay");
      const rz = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      const rzOrder = await rz.orders.create({ amount: Math.round(amount * 100), currency: "INR", receipt: orderId });
      await Order.findByIdAndUpdate(orderId, { razorpayOrderId: rzOrder.id });
      return res.json({ keyId: process.env.RAZORPAY_KEY_ID, amount: rzOrder.amount, currency: rzOrder.currency, razorpayOrderId: rzOrder.id });
    }
    
    // Fallback for dev/mock:
    res.json({ keyId: "rzp_test_mock", amount: Math.round(amount * 100), currency: "INR", razorpayOrderId: "order_mock_" + Date.now() });
  } catch (err) {
    console.error("Payment create error:", err);
    res.status(500).json({ error: "Payment setup failed." });
  }
});

/* POST /api/payment/verify — Razorpay verify */
router.post("/verify", auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, ourOrderId } = req.body;
    
    // In production, verify signature with crypto
    if (process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.includes("placeholder")) {
      const crypto = require("crypto");
      const generated = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");
      if (generated !== razorpay_signature) {
        return res.status(400).json({ error: "Payment verification failed." });
      }
    }
    
    await Order.findByIdAndUpdate(ourOrderId, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "confirmed",
      $push: { statusHistory: { status: "confirmed", note: "Payment verified via Razorpay" } }
    });
    
    res.json({ success: true, message: "Payment verified!", verified: true });
  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({ error: "Verification failed." });
  }
});

/* POST /api/payment/upi — UPI payment setup */
router.post("/upi", auth, async (req, res) => {
  try {
    const { ourOrderId, amount } = req.body;
    const merchantUpiId = process.env.MERCHANT_UPI_ID || "himsaru@upi";
    const upiLink = `upi://pay?pa=${merchantUpiId}&pn=HIMSARU&am=${amount}&cu=INR&tn=Order-${ourOrderId}`;
    res.json({ merchantUpiId, upiLink, orderId: ourOrderId });
  } catch (err) {
    console.error("UPI setup error:", err);
    res.status(500).json({ error: "UPI setup failed." });
  }
});

/* POST /api/payment/upi/confirm */
router.post("/upi/confirm", auth, async (req, res) => {
  try {
    const { ourOrderId, utrNumber } = req.body;
    if (!utrNumber) return res.status(400).json({ error: "UTR number required." });
    
    await Order.findByIdAndUpdate(ourOrderId, {
      utr: utrNumber,
      status: "confirmed",
      $push: { statusHistory: { status: "confirmed", note: `UPI Payment confirmed with UTR: ${utrNumber}` } }
    });
    
    res.json({ message: "UPI payment confirmed!", verified: true });
  } catch (err) {
    console.error("UPI confirm error:", err);
    res.status(500).json({ error: "UPI confirmation failed." });
  }
});

module.exports = router;
