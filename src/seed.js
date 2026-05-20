const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Product, User } = require("./models");
require("dotenv").config();

const products = [
  {
    name: "A2 Bilona Ghee",
    hindiName: "आ2 बिलोना घी",
    category: "A2 Ghee",
    description: "Hand-churned A2 Bilona Ghee made from the milk of indigenous Gir cows. Prepared using the traditional bilona method where curd is churned to extract butter, then slow-cooked over a wood fire. Rich in Omega-3, vitamins A, D, E, and K2. Free from additives and preservatives.",
    shortDesc: "Hand-churned A2 ghee from indigenous Gir cows using traditional bilona method",
    ingredients: "Pure A2 milk cream from indigenous cows, hand-churned using traditional Bilona method.",
    benefits: [
      "Rich in A2 beta-casein — easier to digest",
      "Vitamins A, D, E, K2",
      "Supports immunity and gut health",
      "Butyric acid supports colon health",
      "Boosts brain function"
    ],
    howToUse: "Use for dal tadka, rotis, khichdi, or a spoonful in warm milk every morning. Ideal for Ayurvedic preparations.",
    price: 899,
    mrp: 1099,
    unit: "500ml",
    images: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80", "https://images.unsplash.com/photo-1645696301019-35adcc18cabb?w=300&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
    tags: ["A2", "Bilona", "Organic", "Grass-fed"],
    variants: [
      { label: "250ml", price: 499, mrp: 599, unit: "250ml", stock: 50 },
      { label: "500ml", price: 899, mrp: 1099, unit: "500ml", stock: 100 },
      { label: "1L", price: 1699, mrp: 1999, unit: "1L", stock: 75 }
    ],
    badge: "Bestseller",
    stock: 225,
    rating: 4.8,
    reviewCount: 342,
    seoTitle: "A2 Bilona Ghee - Pure Himalayan Cow Ghee | HIMSARU",
    seoDesc: "Buy authentic A2 Bilona Ghee from HIMSARU. Hand-churned from indigenous Gir cow milk using traditional methods."
  },
  {
    name: "Wild Forest Honey",
    hindiName: "जंगली शहद",
    category: "Wild Honey",
    description: "Raw, unfiltered wild forest honey collected from the pristine Himalayan forests of Uttarakhand. Our tribal honey hunters collect this honey from wild bee hives in the deep forests. No heating, no filtering - just pure, natural honey with all enzymes and pollen intact.",
    shortDesc: "Raw, unfiltered wild honey from Himalayan forests - pure and natural",
    ingredients: "100% pure wild forest honey. No sugar, no heat treatment, no filtration.",
    benefits: [
      "Helps manage blood sugar levels",
      "Powerful antioxidant & antibacterial",
      "Rich in enzymes and propolis",
      "Boosts immunity naturally"
    ],
    howToUse: "Take 1 tsp with warm water in the morning. Never heat above 40°C.",
    price: 549,
    mrp: 699,
    unit: "500g",
    images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80", "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=300&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
    tags: ["Raw", "Unfiltered", "Wild", "Himalayan"],
    variants: [
      { label: "250g", price: 299, mrp: 399, unit: "250g", stock: 40 },
      { label: "500g", price: 549, mrp: 699, unit: "500g", stock: 80 },
      { label: "1kg", price: 999, mrp: 1299, unit: "1kg", stock: 60 }
    ],
    badge: "Bestseller",
    stock: 180,
    rating: 4.9,
    reviewCount: 528,
    seoTitle: "Wild Forest Honey - Raw Himalayan Honey | HIMSARU",
    seoDesc: "Buy pure wild forest honey from HIMSARU. Raw, unfiltered honey collected from Himalayan forests by tribal honey hunters."
  },
  {
    name: "Wild Jamun Honey",
    hindiName: "जामुन शहद",
    category: "Wild Honey",
    description: "Limited edition wild Jamun honey collected during the Jamun flowering season. Dark amber color with a unique, slightly bitter-sweet taste. Rich in antioxidants and beneficial for blood sugar management. Collected from the Shivalik range forests.",
    shortDesc: "Limited stock wild Jamun honey - dark, antioxidant-rich, unique flavor",
    ingredients: "100% pure wild Jamun honey. No additives, no filtration, no heat.",
    benefits: [
      "Helps manage blood sugar levels",
      "Powerful antioxidant & antibacterial",
      "Rich in enzymes and propolis",
      "Boosts immunity naturally"
    ],
    howToUse: "Take 1 tsp with warm water in the morning. Never heat above 40°C.",
    price: 649,
    mrp: 799,
    unit: "500g",
    images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
    tags: ["Jamun", "Limited", "Antioxidant", "Rare"],
    variants: [
      { label: "250g", price: 349, mrp: 449, unit: "250g", stock: 20 },
      { label: "500g", price: 649, mrp: 799, unit: "500g", stock: 35 }
    ],
    badge: "Limited",
    stock: 55,
    rating: 4.7,
    reviewCount: 89,
    seoTitle: "Wild Jamun Honey - Rare Himalayan Honey | HIMSARU",
    seoDesc: "Limited edition wild Jamun honey from Himalayan forests. Dark, antioxidant-rich honey with unique flavor."
  },
  {
    name: "Pink Rock Salt (Sendha Namak)",
    hindiName: "सेंधा नमक",
    category: "Pahadi Salts",
    description: "Natural pink rock salt mined from the ancient salt deposits of the Himalayan foothills. Unrefined and unprocessed, retaining 84 essential trace minerals. This is the purest form of salt used in Ayurvedic practices and fasting rituals.",
    shortDesc: "Natural Himalayan pink rock salt with 84 trace minerals - unrefined and pure",
    ingredients: "Himalayan pink rock salt. Unrefined and unprocessed.",
    benefits: [
      "Contains 84 natural trace minerals",
      "Aids digestion naturally",
      "No anti-caking agents or bleach",
      "Supports electrolyte balance"
    ],
    howToUse: "Use as a daily table salt or in cooking and seasoning.",
    price: 199,
    mrp: 249,
    unit: "500g",
    images: ["https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&q=80",
    tags: ["Pink Salt", "Mineral-rich", "Ayurvedic", "Unrefined"],
    variants: [
      { label: "250g", price: 129, mrp: 159, unit: "250g", stock: 100 },
      { label: "500g", price: 199, mrp: 249, unit: "500g", stock: 150 },
      { label: "1kg", price: 349, mrp: 449, unit: "1kg", stock: 100 }
    ],
    badge: "Bestseller",
    stock: 350,
    rating: 4.6,
    reviewCount: 267,
    seoTitle: "Himalayan Pink Rock Salt - Sendha Namak | HIMSARU",
    seoDesc: "Buy natural Himalayan pink rock salt from HIMSARU. Unrefined salt with 84 trace minerals."
  },
  {
    name: "Black Salt (Kala Namak)",
    hindiName: "काला नमक",
    category: "Pahadi Salts",
    description: "Traditional Himalayan black salt with its distinctive sulfurous aroma and tangy flavor. Used extensively in Indian chaats, chutneys, and digestive remedies. Contains beneficial minerals and is known for its digestive properties.",
    shortDesc: "Traditional Himalayan black salt - tangy, digestive, perfect for chaats",
    ingredients: "Himalayan black salt, stone-ground with traditional methods.",
    benefits: [
      "Improves digestion & reduces bloating",
      "Unique sulfurous minerals",
      "Perfect for Ayurvedic home remedies"
    ],
    howToUse: "Sprinkle on fresh fruits, salads, raita, or use in digestive recipes.",
    price: 149,
    mrp: 189,
    unit: "500g",
    images: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80",
    tags: ["Black Salt", "Digestive", "Chaat Masala", "Traditional"],
    variants: [
      { label: "250g", price: 99, mrp: 129, unit: "250g", stock: 80 },
      { label: "500g", price: 149, mrp: 189, unit: "500g", stock: 120 }
    ],
    stock: 200,
    rating: 4.5,
    reviewCount: 156,
    seoTitle: "Himalayan Black Salt - Kala Namak | HIMSARU",
    seoDesc: "Buy traditional Himalayan black salt from HIMSARU. Perfect for chaats and digestive health."
  },
  {
    name: "Gahat (Kulath) Dal",
    hindiName: "गहत दाल",
    category: "Mountain Pulses",
    description: "Organic Gahat (Kulath) dal grown in the high-altitude terraced fields of Uttarakhand. This rare mountain pulse is known for its exceptional protein content and medicinal properties, especially for kidney health and diabetes management. Stone-ground to preserve nutrients.",
    shortDesc: "Rare mountain pulse from high-altitude fields - protein-rich, medicinal",
    ingredients: "Pure organic Gahat (Horse Gram) dal.",
    benefits: [
      "Dissolves kidney & urinary stones naturally",
      "Very high protein and dietary fiber",
      "Rich in calcium, iron, zinc",
      "Traditional winter health food"
    ],
    howToUse: "Soak 8 hours. Pressure cook with garlic, ghee and Pahadi salt.",
    price: 249,
    mrp: 299,
    unit: "1kg",
    images: ["https://images.unsplash.com/photo-1576181256399-834e3b3a49bf?w=600&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1576181256399-834e3b3a49bf?w=600&q=80",
    tags: ["Organic", "Protein-rich", "Medicinal", "Rare"],
    variants: [
      { label: "500g", price: 149, mrp: 179, unit: "500g", stock: 60 },
      { label: "1kg", price: 249, mrp: 299, unit: "1kg", stock: 100 },
      { label: "2kg", price: 449, mrp: 549, unit: "2kg", stock: 50 }
    ],
    badge: "Bestseller",
    stock: 210,
    rating: 4.7,
    reviewCount: 198,
    seoTitle: "Gahat Dal - Organic Mountain Pulse | HIMSARU",
    seoDesc: "Buy organic Gahat (Kulath) dal from HIMSARU. Rare mountain pulse from Uttarakhand highlands."
  },
  {
    name: "Rajma Chakrata",
    hindiName: "राजमा चकराता",
    category: "Mountain Pulses",
    description: "Famous Chakrata Rajma grown in the cool climate of the Jaunsar-Bawar region. These small, dark red kidney beans are known for their creamy texture and rich, nutty flavor. Cooked slowly, they develop an unmatched taste that has made Chakrata Rajma legendary across India.",
    shortDesc: "Legendary Chakrata Rajma - creamy, nutty, from Jaunsar-Bawar region",
    ingredients: "Pure high-altitude Chakrata Rajma kidney beans.",
    benefits: [
      "High plant protein & dietary fiber",
      "Rich in iron, folate, potassium",
      "Low glycemic index — good for diabetics",
      "Heart-healthy"
    ],
    howToUse: "Soak overnight, pressure cook 4-5 whistles. Best served with red rice and ghee.",
    price: 299,
    mrp: 349,
    unit: "1kg",
    images: ["https://images.unsplash.com/photo-1604929822687-38a1a85c0ed8?w=600&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1604929822687-38a1a85c0ed8?w=600&q=80",
    tags: ["Chakrata", "Rajma", "Creamy", "Premium"],
    variants: [
      { label: "500g", price: 169, mrp: 199, unit: "500g", stock: 70 },
      { label: "1kg", price: 299, mrp: 349, unit: "1kg", stock: 120 }
    ],
    badge: "New",
    stock: 190,
    rating: 4.8,
    reviewCount: 245,
    seoTitle: "Chakrata Rajma - Famous Himalayan Kidney Beans | HIMSARU",
    seoDesc: "Buy authentic Chakrata Rajma from HIMSARU. Famous kidney beans from Jaunsar-Bawar region."
  },
  {
    name: "Red Rice (Lal Chawal)",
    hindiName: "लाल चावल",
    category: "Rice",
    description: "Nutrient-dense red rice grown in the terraced paddy fields of the Garhwal Himalayas. This ancient rice variety gets its color from anthocyanin antioxidants. High in fiber, iron, and zinc with a distinct nutty flavor. Traditionally used in Pahadi festivals and ceremonies.",
    shortDesc: "Antioxidant-rich red rice from Garhwal Himalayas - nutty, fiber-rich",
    ingredients: "100% whole grain Himalayan red rice.",
    benefits: [
      "Rich in anthocyanin antioxidants",
      "Higher fiber than polished white rice",
      "Low glycemic index",
      "Earthy, nutty flavor profile"
    ],
    howToUse: "Soak 30 minutes, cook in 1:2.5 rice-to-water ratio.",
    price: 349,
    mrp: 429,
    unit: "1kg",
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
    tags: ["Red Rice", "Antioxidant", "Fiber-rich", "Ancient"],
    variants: [
      { label: "500g", price: 199, mrp: 249, unit: "500g", stock: 50 },
      { label: "1kg", price: 349, mrp: 429, unit: "1kg", stock: 80 },
      { label: "5kg", price: 1599, mrp: 1999, unit: "5kg", stock: 30 }
    ],
    badge: "New",
    stock: 160,
    rating: 4.6,
    reviewCount: 134,
    seoTitle: "Red Rice - Himalayan Lal Chawal | HIMSARU",
    seoDesc: "Buy nutrient-dense red rice from HIMSARU. Anthocyanin-rich rice from Garhwal Himalayas."
  },
  {
    name: "Jakhya (Wild Mustard Seeds)",
    hindiName: "जख्या",
    category: "Spices",
    description: "Wild mustard seeds (Jakhya) foraged from the Himalayan foothills. These tiny seeds burst with a unique nutty, pungent flavor when tempered in hot oil. An essential spice in Pahadi cuisine, used in dals, vegetables, and raita. No cultivated mustard can match its wild intensity.",
    shortDesc: "Wild Himalayan mustard seeds - nutty, pungent, essential Pahadi spice",
    ingredients: "100% wild Jakhya (Cleome viscosa) seeds.",
    benefits: [
      "Rich in natural antioxidants",
      "Helps digestion",
      "Authentic wild mountain foraging"
    ],
    howToUse: "Temper in hot oil/ghee before cooking dals, green leafy vegetables, or potatoes.",
    price: 129,
    mrp: 159,
    unit: "100g",
    images: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80",
    tags: ["Wild", "Mustard", "Tempering", "Authentic"],
    variants: [
      { label: "50g", price: 79, mrp: 99, unit: "50g", stock: 60 },
      { label: "100g", price: 129, mrp: 159, unit: "100g", stock: 100 },
      { label: "250g", price: 279, mrp: 349, unit: "250g", stock: 50 }
    ],
    stock: 210,
    rating: 4.8,
    reviewCount: 312,
    seoTitle: "Jakhya - Wild Himalayan Mustard Seeds | HIMSARU",
    seoDesc: "Buy wild Jakhya mustard seeds from HIMSARU. Essential Pahadi tempering spice."
  },
  {
    name: "Timur (Sichuan Pepper)",
    hindiName: "टिमुर",
    category: "Spices",
    description: "Wild Timur (Sichuan Pepper) hand-picked from the oak and rhododendron forests of Kumaon. This rare spice creates a unique numbing, citrusy sensation on the tongue. Used in traditional Pahadi dishes like Chainsoo and Gahat ke Paranthe. Also known for its digestive and medicinal properties.",
    shortDesc: "Wild Timur pepper - numbing, citrusy, rare Himalayan spice",
    ingredients: "Pure hand-picked wild Timur (Zanthoxylum armatum) pods.",
    benefits: [
      "Unique numbing, warming properties",
      "Excellent digestive aid",
      "Stimulates blood circulation"
    ],
    howToUse: "Crush and add to chutneys, soups, or use as a spice rub for vegetables and meats.",
    price: 199,
    mrp: 249,
    unit: "50g",
    images: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80",
    tags: ["Timur", "Sichuan", "Numbing", "Rare"],
    variants: [
      { label: "25g", price: 119, mrp: 149, unit: "25g", stock: 40 },
      { label: "50g", price: 199, mrp: 249, unit: "50g", stock: 70 },
      { label: "100g", price: 349, mrp: 449, unit: "100g", stock: 40 }
    ],
    badge: "Limited",
    stock: 150,
    rating: 4.7,
    reviewCount: 178,
    seoTitle: "Timur - Wild Sichuan Pepper | HIMSARU",
    seoDesc: "Buy wild Timur (Sichuan Pepper) from HIMSARU. Rare numbing spice from Kumaon forests."
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert products
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: "admin@himsaru.com" });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      await User.create({
        firstName: "HIMSARU",
        lastName: "Admin",
        email: "admin@himsaru.com",
        phone: "+91 7900474328",
        password: hashedPassword,
        role: "admin"
      });
      console.log("Created admin user: admin@himsaru.com / admin123");
    }

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📦 Products added:");
    products.forEach(p => console.log(`   • ${p.name} - ₹${p.price}`));

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seedDatabase();
