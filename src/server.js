const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const app = express();

// Trust proxy for express-rate-limit in production (Render)
app.set("trust proxy", 1);

// Security & performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.razorpay.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(morgan("dev"));

// Rate limiting to prevent abuse and brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP. Please try again after 15 minutes." }
});
app.use("/api/", apiLimiter);

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "http://localhost:5000",
      "http://localhost:5500",
      "http://127.0.0.1:5500"
    ].filter(Boolean);

    if (!origin || origin === "null" || allowedOrigins.includes(origin) || origin.includes("vercel.app") || origin.includes("localhost") || origin.includes("127.0.0.1")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Session-Id"]
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Health check (works even without MongoDB)
app.get("/api/health", (req, res) => {
  const checkKey = (val, placeholder) => {
    if (!val) return "❌ NOT SET";
    const clean = val.trim();
    if (clean === placeholder || clean.includes("placeholder")) return "⚠️ PLACEHOLDER";
    return `✅ SET (${clean.length} chars)`;
  };

  res.json({
    success: true,
    message: "HIMSARU API is running!",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
    mongoConnected: mongoose.connection.readyState === 1,
    diagnostics: {
      SMTP_HOST: checkKey(process.env.SMTP_HOST, "smtp.gmail.com"),
      SMTP_PORT: process.env.SMTP_PORT ? `✅ SET (${process.env.SMTP_PORT})` : "❌ NOT SET",
      SMTP_USER: checkKey(process.env.SMTP_USER, "your_gmail@gmail.com"),
      SMTP_PASS: checkKey(process.env.SMTP_PASS, "your_16_char_app_password"),
      FROM_EMAIL: checkKey(process.env.FROM_EMAIL, "HIMSARU <no-reply@himsaru.com>"),
      SMS_API_KEY: checkKey(process.env.SMS_API_KEY, "your_fast2sms_api_key_here")
    }
  });
});

// Root check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to HIMSARU API",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders",
      contact: "/api/contact"
    }
  });
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/admin", require("./routes/admin"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("⚠️  MONGODB_URI not set — API will run without database");
      console.log("   Set MONGODB_URI in your environment variables");
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed database if it is empty
    const { seedDatabase } = require("./utils/seeder");
    await seedDatabase(false);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("   The API will continue running but database features won't work.");
    console.log("   To fix: Set MONGODB_URI in your environment variables.");
  }
};

// Start server
const PORT = process.env.PORT || 10000;

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 HIMSARU Server running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`\n📋 Available Endpoints:`);
    console.log(`   GET  /api/health          - Health check`);
    console.log(`   POST /api/auth/register   - Register new user`);
    console.log(`   POST /api/auth/login      - Login user`);
    console.log(`   GET  /api/products        - Get all products`);
    console.log(`   GET  /api/products/:id    - Get single product`);
    console.log(`   POST /api/orders          - Create order`);
    console.log(`   GET  /api/orders          - Get user orders`);
    console.log(`   POST /api/contact         - Submit contact form`);
    console.log(`\n🌿 Welcome to HIMSARU - Pure Taste of the Himalayas!\n`);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
});

module.exports = app;
