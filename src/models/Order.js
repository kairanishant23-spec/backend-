const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String },
  variant: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  mrp: { type: Number }
});

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  email: { type: String }
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true, required: true },
    items: [orderItemSchema],
    address: addressSchema,
    paymentMethod: {
      type: String,
      enum: ["upi", "razorpay", "cod"],
      required: true
    },
    status: {
      type: String,
      enum: ["placed", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "placed"
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
      }
    ],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    // UPI
    utr: { type: String },
    // Razorpay
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    // COD
    codVerified: { type: Boolean, default: false },
    notes: { type: String },
    estimatedDelivery: { type: Date },
    createdAtIST: { type: String }
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model("Order", orderSchema);
