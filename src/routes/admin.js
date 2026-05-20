const express = require("express");
const { Order, Product, Contact, User } = require("../models");
const { auth, adminOnly } = require("../middleware/auth");
const { notifyOrderStatusUpdate } = require("../utils/notifications");

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats
// @access  Private/Admin
router.get("/dashboard", auth, adminOnly, async (req, res) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      pendingOrders,
      recentOrders,
      unreadContacts
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Product.countDocuments({ isActive: true }),
      User.countDocuments(),
      Order.countDocuments({ status: { $in: ["placed", "confirmed", "processing"] } }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "firstName lastName").lean(),
      Contact.countDocuments({ isRead: false })
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalProducts,
        totalUsers,
        pendingOrders,
        unreadContacts
      },
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders (admin)
// @access  Private/Admin
router.get("/orders", auth, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("user", "firstName lastName email phone")
        .lean(),
      Order.countDocuments(query)
    ]);

    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put("/orders/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
    await order.save();

    // Trigger email and SMS notifications to the customer
    notifyOrderStatusUpdate(order._id, status).catch(err => console.error("Notification trigger error:", err));

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   GET /api/admin/contacts
// @desc    Get all contact submissions
// @access  Private/Admin
router.get("/contacts", auth, adminOnly, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   PUT /api/admin/contacts/:id/read
// @desc    Mark contact as read
// @access  Private/Admin
router.put("/contacts/:id/read", auth, adminOnly, async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
