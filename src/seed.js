const mongoose = require("mongoose");
const { seedDatabase } = require("./utils/seeder");
require("dotenv").config();

const run = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is not defined in environment variables.");
      process.exit(1);
    }
    
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully. Seeding products...");
    
    await seedDatabase(true); // Force clear and Reseed
    
    console.log("\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed script failed:", err);
    process.exit(1);
  }
};

run();
