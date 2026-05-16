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
    price: 899,
    mrp: 1099,
    unit: "500ml",
    images: ["/images/ghee-1.jpg", "/images/ghee-2.jpg"],
    thumbnail: "/images/ghee-thumb.jpg",
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
    price: 549,
    mrp: 699,
    unit: "500g",
    images: ["/images/honey-1.jpg", "/images/honey-2.jpg"],
    thumbnail: "/images/honey-thumb.jpg",
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
    price: 649,
    mrp: 799,
    unit: "500g",
    images: ["/images/jamun-honey-1.jpg"],
    thumbnail: "/images/jamun-honey-thumb.jpg",
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
    price: 199,
    mrp: 249,
    unit: "500g",
    images: ["/images/salt-1.jpg", "/images/salt-2.jpg"],
    thumbnail: "/images/salt-thumb.jpg",
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
    price: 149,
    mrp: 189,
    unit: "500g",
    images: ["/images/black-salt-1.jpg"],
    thumbnail: "/images/black-salt-thumb.jpg",
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
    price: 249,
    mrp: 299,
    unit: "1kg",
    images: ["/images/gahat-1.jpg"],
    thumbnail: "/images/gahat-thumb.jpg",
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
    price: 299,
    mrp: 349,
    unit: "1kg",
    images: ["/images/rajma-1.jpg", "/images/rajma-2.jpg"],
    thumbnail: "/images/rajma-thumb.jpg",
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
    price: 349,
    mrp: 429,
    unit: "1kg",
    images: ["/images/red-rice-1.jpg"],
    thumbnail: "/images/red-rice-thumb.jpg",
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
    price: 129,
    mrp: 159,
    unit: "100g",
    images: ["/images/jakhya-1.jpg"],
    thumbnail: "/images/jakhya-thumb.jpg",
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
    price: 199,
    mrp: 249,
    unit: "50g",
    images: ["/images/timur-1.jpg"],
    thumbnail: "/images/timur-thumb.jpg",
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
