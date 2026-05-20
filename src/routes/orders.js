const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { Order, Product } = require("../models");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Initialize Razorpay
const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
}) : null;

// Generate order number
const generateOrderNumber = () => {
  const prefix = "HMS";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Calculate totals from cart items
const calculateTotals = (items) => {
  let subtotal = 0;
  let mrpTotal = 0;

  items.forEach(item => {
    subtotal += item.price * item.quantity;
    if (item.mrp) mrpTotal += item.mrp * item.quantity;
  });

  const shipping = subtotal >= 799 ? 0 : 60;
  const total = subtotal + shipping;

  return { subtotal, shipping, total, discount: mrpTotal > subtotal ? mrpTotal - subtotal : 0 };
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { items, address, paymentMethod, utr, notes } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    // Validate stock
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ success: false, message: `Invalid product ID for: ${item.name}. Please refresh your page and try again.` });
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
    }

    const { subtotal, shipping, total, discount } = calculateTotals(items);
    const orderNumber = generateOrderNumber();

    // Prepare order items
    const orderItems = items.map(item => ({
      product: item.productId,
      name: item.name,
      image: item.image,
      variant: item.variant || null,
      quantity: item.quantity,
      price: item.price,
      mrp: item.mrp || null
    }));

    const orderData = {
      user: req.user._id,
      orderNumber,
      items: orderItems,
      address,
      paymentMethod,
      subtotal,
      shipping,
      discount,
      total,
      notes,
      statusHistory: [{ status: "placed", note: "Order placed successfully" }],
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
    };

    // Handle UPI
    if (paymentMethod === "upi") {
      if (utr) {
        orderData.utr = utr;
      }
    }

    // Handle Razorpay
    let razorpayOrder = null;
    if (paymentMethod === "razorpay" && razorpay) {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: orderNumber
      });
      orderData.razorpayOrderId = razorpayOrder.id;
    }

    const order = await Order.create(orderData);

    // Update stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json({
      success: true,
      order: {
        _id: order._id,
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        razorpayOrderId: order.razorpayOrderId
      }
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, message: "Server error creating order." });
  }
});

// @route   POST /api/orders/verify-razorpay
// @desc    Verify Razorpay payment
// @access  Private
router.post("/verify-razorpay", auth, async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body = orderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;

    if (isAuthentic) {
      await Order.findByIdAndUpdate(orderId, {
        razorpayPaymentId,
        razorpaySignature,
        status: "confirmed",
        $push: { statusHistory: { status: "confirmed", note: "Payment verified via Razorpay" } }
      });
      res.json({ success: true, message: "Payment verified successfully." });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment signature." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Verification error." });
  }
});

// @route   GET /api/orders/my
// @desc    Get user's orders (compatibility alias)
// @access  Private
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name thumbnail category")
      .lean();

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name thumbnail category")
      .lean();

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate("items.product", "name thumbnail category")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({ success: false, message: "Order cannot be cancelled." });
    }

    order.status = "cancelled";
    order.statusHistory.push({ status: "cancelled", note: "Cancelled by user" });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    res.json({ success: true, message: "Order cancelled successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
