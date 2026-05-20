const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hindiName: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["A2 Ghee", "Wild Honey", "Pahadi Salts", "Mountain Pulses", "Rice", "Spices", "Other"]
    },
    description: { type: String, required: true },
    shortDesc: { type: String },
    ingredients: { type: String },
    benefits: [{ type: String }],
    howToUse: { type: String },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    unit: { type: String, default: "unit" },
    images: [{ type: String }],
    thumbnail: { type: String },
    tags: [{ type: String }],
    variants: [
      {
        label: String,
        price: Number,
        mrp: Number,
        unit: String,
        stock: { type: Number, default: 100 }
      }
    ],
    badge: { type: String, enum: ["Bestseller", "New", "Limited", "Sale", null], default: null },
    stock: { type: Number, default: 100, min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seoTitle: { type: String },
    seoDesc: { type: String }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", tags: "text", category: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model("Product", productSchema);
