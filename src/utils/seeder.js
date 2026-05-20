const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Product, User } = require("../models");

// 15 Premium products from frontend index.html as a fallback if index.html is not accessible (e.g., on Render)
const fallbackProducts = [
  {
    name: "Badri Cow Ghee (A2)",
    hindiName: "बद्री गाय का शुद्ध देसी घी",
    category: "A2 Ghee",
    description: "The Badri cow is a rare indigenous breed native to Uttarakhand, found grazing on Himalayan herbs at altitudes above 1500m. Their milk is uniquely rich in A2 beta-casein protein. Prepared using the ancient Bilona method — raw milk -> curd set overnight -> hand-churned -> slowly clarified over a wood fire. The result is a deeply aromatic, golden ghee that carries the essence of the Himalayas in every spoonful.",
    shortDesc: "Rarest Pahadi ghee — Bilona method, from sacred Badri cows grazing on Himalayan herbs above 1500m.",
    ingredients: "Pure A2 milk cream from Badri cows, hand-churned using traditional Bilona method. No added colors, flavors, or preservatives.",
    benefits: [
      "Rich in A2 beta-casein — easier to digest",
      "Vitamins A, D, E, K2",
      "Supports immunity and gut health",
      "Butyric acid supports colon health",
      "Boosts brain function"
    ],
    howToUse: "Use for dal tadka, rotis, khichdi, or a spoonful in warm milk every morning. Ideal for Ayurvedic preparations. 12 months shelf life.",
    price: 1999,
    mrp: 2100,
    unit: "500g",
    images: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
      "https://images.unsplash.com/photo-1645696301019-35adcc18cabb?w=300&q=80",
      "https://images.unsplash.com/photo-1598300188904-6a1a70d49f40?w=300&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
    tags: ["A2 Milk", "Bilona Method", "Grass-Fed", "No Additives"],
    variants: [
      { label: "500g", price: 1999, mrp: 2100, unit: "500g", stock: 100 },
      { label: "1kg", price: 2999, mrp: 3500, unit: "1kg", stock: 100 }
    ],
    badge: "BESTSELLER",
    stock: 100,
    rating: 4.9,
    reviewCount: 120,
    isActive: true
  },
  {
    name: "Jamun Honey",
    hindiName: "जामुन शहद",
    category: "Wild Honey",
    description: "Sourced from the dense Jamun (black plum) forests of the Himalayan foothills during the brief flowering season. This mono-floral honey has a distinct dark color, a slightly bitter-sweet taste, and a rich floral aroma. It is widely valued in Ayurveda for its unique therapeutic properties.",
    shortDesc: "Raw, wild Jamun honey with deep floral notes. Known for blood sugar management and antioxidant properties.",
    ingredients: "100% pure raw Jamun honey. Unfiltered, unpasteurized, and organic.",
    benefits: [
      "Low glycemic index compared to regular honey",
      "Helps regulate blood sugar levels",
      "Rich in antioxidants and active enzymes",
      "Soothes cough and throat irritation",
      "Improves digestion"
    ],
    howToUse: "Take 1-2 teaspoons daily on an empty stomach, or mix with warm water. Do not add to boiling hot liquids to preserve enzymes.",
    price: 530,
    mrp: 600,
    unit: "500g",
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
      "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
    tags: ["Raw Honey", "Wild Harvested", "Unpasteurized", "Organic"],
    variants: [
      { label: "500g", price: 530, mrp: 600, unit: "500g", stock: 100 },
      { label: "1kg", price: 999, mrp: 1100, unit: "1kg", stock: 100 }
    ],
    badge: "BESTSELLER",
    stock: 100,
    rating: 4.8,
    reviewCount: 85,
    isActive: true
  },
  {
    name: "Mustard Honey",
    hindiName: "सरसों का शहद",
    category: "Wild Honey",
    description: "Collected from the organic mustard fields of the high-altitude valleys. Pale golden and creamy, this honey is unique because it naturally crystallizes very quickly due to high glucose content. Crystallization is a guarantee of pure, unprocessed honey.",
    shortDesc: "Pale golden mustard honey — naturally crystallises quickly. Excellent for heart health and respiratory issues.",
    ingredients: "100% raw mono-floral mustard honey.",
    benefits: [
      "Provides instant energy and boosts metabolism",
      "Contains warming properties, perfect for winters",
      "Supports cardiovascular health",
      "Natural cough suppressant",
      "Relieves muscle aches"
    ],
    howToUse: "Spread it like jam on toast, use it in salad dressings, or consume a teaspoon directly. If crystallized, place the jar in warm water to liquefy.",
    price: 530,
    mrp: 600,
    unit: "500g",
    images: [
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&q=80",
      "https://images.unsplash.com/photo-1587049352851-8d4e89134292?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&q=80",
    tags: ["Creamy Honey", "Pure Mustard", "Natural", "Crystallizing"],
    variants: [
      { label: "500g", price: 530, mrp: 600, unit: "500g", stock: 100 },
      { label: "1kg", price: 999, mrp: 1100, unit: "1kg", stock: 100 }
    ],
    badge: null,
    stock: 100,
    rating: 4.6,
    reviewCount: 42,
    isActive: true
  },
  {
    name: "Multi Floral Honey",
    hindiName: "बहु-पुष्प शहद",
    category: "Wild Honey",
    description: "A rich, dark honey harvested from wild hives in deep Himalayan forests. Bees collect nectar from a wide range of alpine flowers including Rhododendron (Buransh), oak blossom, wild rose, and medicinal herbs. This gives the honey a complex, multi-layered floral profile that changes slightly with the seasons.",
    shortDesc: "Wild multi-floral honey from Himalayan meadows — Buransh, Oak and dozens of alpine blossoms.",
    ingredients: "100% wild forest multi-floral honey. Raw and unfiltered.",
    benefits: [
      "Broad-spectrum nutrient profile from diverse flora",
      "High level of bio-active compounds and antioxidants",
      "Boosts daily immunity and vitality",
      "Excellent natural sweetener",
      "Aids wound healing and skin health"
    ],
    howToUse: "Excellent daily sugar replacement for tea, green tea, lemon water, pancakes, or baking recipes.",
    price: 500,
    mrp: 560,
    unit: "500g",
    images: [
      "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=600&q=80",
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=600&q=80",
    tags: ["Multi-Floral", "Wild Forest", "Raw", "Immunity Booster"],
    variants: [
      { label: "500g", price: 500, mrp: 560, unit: "500g", stock: 100 },
      { label: "1kg", price: 920, mrp: 1050, unit: "1kg", stock: 100 }
    ],
    badge: "SALE",
    stock: 100,
    rating: 4.7,
    reviewCount: 96,
    isActive: true
  },
  {
    name: "Indica Honey",
    hindiName: "इंडिका शहद",
    category: "Wild Honey",
    description: "Sourced from the hives of Apis Cerana Indica, the native Himalayan honey bee. These bees are smaller than commercial bees and forage on small wildflower blossoms that are inaccessible to larger bees. The resulting honey is highly concentrated in therapeutic properties, offering a sharp, complex taste and exceptional purity.",
    shortDesc: "Rare Apis Indica (Indian honey bee) honey — smaller bees, more complex honey with deeper therapeutic benefits.",
    ingredients: "100% pure raw Apis Indica honey.",
    benefits: [
      "Stronger antibacterial and anti-inflammatory properties",
      "Rich in trace minerals and medicinal pollen",
      "Improves respiratory health",
      "Highly effective for sore throat and cold",
      "Boosts metabolism"
    ],
    howToUse: "Consume 1 teaspoon directly with a pinch of ginger juice for throat relief, or drizzle over fresh fruit.",
    price: 699,
    mrp: 800,
    unit: "500g",
    images: [
      "https://images.unsplash.com/photo-1587049352851-8d4e89134292?w=600&q=80",
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1587049352851-8d4e89134292?w=600&q=80",
    tags: ["Apis Indica", "Rare", "Medicinal Grade", "Raw Honey"],
    variants: [
      { label: "500g", price: 699, mrp: 800, unit: "500g", stock: 100 },
      { label: "1kg", price: 1500, mrp: 1700, unit: "1kg", stock: 100 }
    ],
    badge: "NEW",
    stock: 100,
    rating: 4.9,
    reviewCount: 38,
    isActive: true
  },
  {
    name: "Garlic Salt (Silbatta)",
    hindiName: "लहसुन नमक — सिलबट्टा",
    category: "Pahadi Salts",
    description: "Pisyu Loon is the traditional stone-ground salt of Uttarakhand. Our Garlic Salt is made by grinding Himalayan rock salt with roasted mountain garlic, fresh green chillies, coriander leaves, and cumin seeds on a large flat stone slab (Silbatta). The stone-grinding process crushes the herbs' cells, releasing their natural oils and infusing the salt with a deeply rich, rustic flavor.",
    shortDesc: "Himalayan rock salt stone-ground with roasted garlic, cumin & Pahadi spices on traditional silbatta.",
    ingredients: "Himalayan pink salt, roasted garlic, fresh green chillies, coriander, cumin seeds, roasted spices.",
    benefits: [
      "Natural rock salt contains 84+ essential minerals",
      "Lower sodium content than commercial table salt",
      "Allicin from garlic supports immune health",
      "No chemical anti-caking agents",
      "Enhances digestion"
    ],
    howToUse: "Sprinkle over salads, roasted vegetables, curries, curd, or fresh fruits. Makes an excellent seasoning for raita.",
    price: 199,
    mrp: 220,
    unit: "100g",
    images: [
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600&q=80",
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600&q=80",
    tags: ["Pisyu Loon", "Silbatta Ground", "Roasted Garlic", "Himalayan Salt"],
    variants: [
      { label: "100g", price: 199, mrp: 220, unit: "100g", stock: 100 }
    ],
    badge: "BESTSELLER",
    stock: 100,
    rating: 4.8,
    reviewCount: 112,
    isActive: true
  },
  {
    name: "Hemp Salt (Silbatta)",
    hindiName: "भांग नमक — सिलबट्टा",
    category: "Pahadi Salts",
    description: "A signature condiment of Uttarakhand, this salt is prepared by stone-grinding toasted hemp seeds (Bhang/Hemp seeds are non-psychoactive) with pink rock salt, coriander, mint, ginger, and garlic. It has a uniquely nutty, earthy taste and an outstanding nutritional profile.",
    shortDesc: "Uttarakhand's legendary Bhang (hemp seed) salt — earthy, nutty, aromatic. A Pahadi kitchen staple.",
    ingredients: "Himalayan rock salt, toasted hemp seeds (non-psychoactive), mint, green chillies, ginger, lemon juice.",
    benefits: [
      "Rich in Omega-3 and Omega-6 fatty acids",
      "Good source of plant-based protein",
      "Rich in minerals like zinc, magnesium, and iron",
      "Earthy taste elevates simple dishes",
      "Supports brain and skin health"
    ],
    howToUse: "Traditionally served with sliced cucumber, radish, or fresh guava. Also delicious sprinkled on curd, salads, or steamed rice with ghee.",
    price: 199,
    mrp: 220,
    unit: "100g",
    images: [
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&q=80",
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&q=80",
    tags: ["Hemp Seeds", "Nutty Flavor", "Pahadi Heritage", "Stone Ground"],
    variants: [
      { label: "100g", price: 199, mrp: 220, unit: "100g", stock: 100 }
    ],
    badge: "NEW",
    stock: 100,
    rating: 4.9,
    reviewCount: 45,
    isActive: true
  },
  {
    name: "Mix Salt (Pisyu Loon)",
    hindiName: "पिस्यूँ लूण — मिक्स",
    category: "Pahadi Salts",
    description: "An authentic, colorful blend of multiple herb-infused salts from the mountains. Ground on traditional silbattas using red chillies, coriander, turmeric, cumin, ginger, and wild mustard seeds, this salt adds a burst of traditional flavor and visual appeal to any dish.",
    shortDesc: "The iconic Pisyu Loon — stone-ground blend of cumin, ajwain, coriander, ginger & Pahadi mirch with Himalayan salt.",
    ingredients: "Himalayan pink salt, red chillies, fresh coriander, ginger, cumin, carom seeds (ajwain), wild mustard seeds.",
    benefits: [
      "Ajwain and ginger aid in curing indigestion",
      "Antioxidant properties from fresh herbs",
      "Complete sodium alternative with natural mineral complexes",
      "Very high aroma profile",
      "100% natural and preservative-free"
    ],
    howToUse: "Use as a finishing salt over fruit bowls, curd, salads, barbecues, or simple khichdi.",
    price: 230,
    mrp: 260,
    unit: "100g",
    images: [
      "https://images.unsplash.com/photo-1549474843-ed235e12af0c?w=600&q=80",
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1549474843-ed235e12af0c?w=600&q=80",
    tags: ["Traditional Salt", "Multi-Herb", "Digestive Salt", "Pahadi Salt"],
    variants: [
      { label: "100g", price: 230, mrp: 260, unit: "100g", stock: 100 }
    ],
    badge: null,
    stock: 100,
    rating: 4.7,
    reviewCount: 68,
    isActive: true
  },
  {
    name: "Pahadi Rajma",
    hindiName: "पहाड़ी राजमा",
    category: "Mountain Pulses",
    description: "Cultivated in the clean air and glacial waters of Harsil and Chakrata valleys at altitudes above 2000m. This Rajma is grown completely organically by local farming cooperatives. Because of the cold mountain climate, these kidney beans are highly concentrated in proteins and have a naturally sweet taste and a fast cooking time.",
    shortDesc: "The famous Pahadi kidney beans — grown at 1500–2500m without pesticides. Incomparably flavorful.",
    ingredients: "100% pure organic Pahadi kidney beans.",
    benefits: [
      "Extremely rich in plant protein and dietary fiber",
      "High in iron, potassium, and magnesium",
      "Easily digestible compared to plain plains Rajma",
      "Low glycemic index, excellent for diabetics",
      "Unpolished and unwashed, retaining all nutrients"
    ],
    howToUse: "Soak overnight for 8 hours. Pressure cook with whole spices (bay leaf, cardamom) and prepare in a traditional iron kadhai for authentic taste.",
    price: 249,
    mrp: 280,
    unit: "500g",
    images: [
      "https://images.unsplash.com/photo-1585996388960-496a79854498?w=600&q=80",
      "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1585996388960-496a79854498?w=600&q=80",
    tags: ["Pahadi Rajma", "Harsil Valley", "High Altitude", "Organic Pulses"],
    variants: [
      { label: "500g", price: 249, mrp: 280, unit: "500g", stock: 100 },
      { label: "1kg", price: 320, mrp: 380, unit: "1kg", stock: 100 }
    ],
    badge: "BESTSELLER",
    stock: 100,
    rating: 4.9,
    reviewCount: 154,
    isActive: true
  },
  {
    name: "Gehat Dal (Horse Gram)",
    hindiName: "गहत दाल — कुलथी",
    category: "Mountain Pulses",
    description: "Gehat (Horse Gram) is a legendary crop grown extensively in terraced fields of Uttarakhand. Known as a medicinal food, it is a key ingredient in winter cuisine because of its warming properties. It has a rich, deep earthy taste and is extremely popular in traditional Pahadi food.",
    shortDesc: "Uttarakhand's wonder pulse — known for dissolving kidney stones naturally. High protein mountain food.",
    ingredients: "100% organic unpolished Gehat (Horse Gram) dal.",
    benefits: [
      "Clinically known to help dissolve kidney stones",
      "Very high in protein and calcium",
      "Diuretic properties support kidney health",
      "Helps regulate blood sugar levels",
      "Burns fat and supports weight management"
    ],
    howToUse: "Soak for 6 hours. Boil and prepare a hearty soup (Gehat Ras) or a thick ground dal (Gehat Fanu) served with hot rice.",
    price: 199,
    mrp: 230,
    unit: "500g",
    images: [
      "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&q=80",
      "https://images.unsplash.com/photo-1585996388960-496a79854498?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&q=80",
    tags: ["Horse Gram", "Medicinal Dal", "Traditional Food", "Unpolished"],
    variants: [
      { label: "500g", price: 199, mrp: 230, unit: "500g", stock: 100 },
      { label: "1kg", price: 299, mrp: 340, unit: "1kg", stock: 100 }
    ],
    badge: null,
    stock: 100,
    rating: 4.7,
    reviewCount: 78,
    isActive: true
  },
  {
    name: "Kale Bhatt (Black Soybean)",
    hindiName: "काले भट्ट",
    category: "Mountain Pulses",
    description: "Bhatt or Black Soybean is the staple pulse of the Kumaon region. Unlike regular yellow soybeans, Black Soybeans have a dark black outer skin which is rich in health-boosting anthocyanin antioxidants. It is used to prepare traditional dishes like 'Bhatt ki Churkani' or 'Bhatt Jaula'.",
    shortDesc: "Black soybean from Uttarakhand — ancient protein source, rich in anthocyanins and antioxidants.",
    ingredients: "100% organic unpolished black soybeans.",
    benefits: [
      "Highest protein content of all plant pulses",
      "Black hull is rich in anthocyanin antioxidants",
      "Excellent source of iron and dietary fiber",
      "Supports bone density and heart health",
      "Enhances hair and skin quality"
    ],
    howToUse: "Dry roast and cook with iron vessel to release nutrients. Best consumed as 'Bhatt ki Churkani' with rice.",
    price: 149,
    mrp: 175,
    unit: "500g",
    images: [
      "https://images.unsplash.com/photo-1585996388960-496a79854498?w=600&q=80",
      "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1585996388960-496a79854498?w=600&q=80",
    tags: ["Black Soybean", "Kumaoni Cuisine", "Superfood", "High Protein"],
    variants: [
      { label: "500g", price: 149, mrp: 175, unit: "500g", stock: 100 },
      { label: "1kg", price: 249, mrp: 290, unit: "1kg", stock: 100 }
    ],
    badge: null,
    stock: 100,
    rating: 4.8,
    reviewCount: 52,
    isActive: true
  },
  {
    name: "Pahadi Haldi (Turmeric)",
    hindiName: "पहाड़ी हल्दी",
    category: "Spices",
    description: "Cultivated in high-altitude mountain valleys, our Pahadi Turmeric is stone-ground. Due to the high altitude and organic farming, it contains high curcumin levels (ranging from 5% to 7%, compared to only 2% in commercial turmeric). Curcumin is the active compound responsible for turmeric's healing properties.",
    shortDesc: "High-altitude Pahadi turmeric with 3–7% curcumin vs 2% commercial. Stone-ground, deeply aromatic.",
    ingredients: "100% pure organic high-altitude turmeric powder.",
    benefits: [
      "Curcumin content up to 7% for superior health benefits",
      "Highly powerful natural anti-inflammatory agent",
      "Strong antioxidant supports liver health",
      "Improves skin health and adds natural glow",
      "Strong antiseptic qualities"
    ],
    howToUse: "Use a small pinch in daily curries, or mix half a teaspoon in warm milk with a pinch of black pepper (which aids curcumin absorption) before bedtime.",
    price: 99,
    mrp: 120,
    unit: "100g",
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80",
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80",
    tags: ["High Curcumin", "Stone Ground Spices", "Anti-inflammatory", "Pure Haldi"],
    variants: [
      { label: "100g", price: 99, mrp: 120, unit: "100g", stock: 100 }
    ],
    badge: "BESTSELLER",
    stock: 100,
    rating: 4.8,
    reviewCount: 76,
    isActive: true
  },
  {
    name: "Red Rice (Pahadi Laal Chawal)",
    hindiName: "पहाड़ी लाल चावल",
    category: "Rice",
    description: "Harvested from the terraced fields of the Tons and Yamuna river valleys. This red-hued rice gets its color from natural anthocyanin compounds in its bran. It is unpolished and partially hulled, which gives it a rich nutty taste and chewy texture, while preserving all its natural fibers, vitamins, and minerals.",
    shortDesc: "Pahadi Red Rice — earthy, nutty, and packed with anthocyanins. Grown in terraced mountain fields.",
    ingredients: "100% unpolished Himalayan red rice.",
    benefits: [
      "Rich in anthocyanin antioxidants",
      "High fiber content helps lower cholesterol",
      "Low glycemic index regulates blood glucose",
      "Source of vitamin B6, iron, and zinc",
      "Keeps you full for longer, helping weight management"
    ],
    howToUse: "Wash thoroughly. Soak for 30 minutes. Use a 1:2.5 ratio of rice to water. Cook in a pressure cooker or open pot until soft and fluffy. Serve with Pahadi Rajma or Bhatt ki Churkani.",
    price: 199,
    mrp: 230,
    unit: "500g",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
      "https://images.unsplash.com/photo-1585996388960-496a79854498?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
    tags: ["Red Rice", "High Fiber", "Nutty Taste", "Terrace Farmed"],
    variants: [
      { label: "500g", price: 199, mrp: 230, unit: "500g", stock: 100 },
      { label: "1kg", price: 249, mrp: 290, unit: "1kg", stock: 100 }
    ],
    badge: null,
    stock: 100,
    rating: 4.7,
    reviewCount: 63,
    isActive: true
  },
  {
    name: "Black Rice (Pahadi Kala Chawal)",
    hindiName: "पहाड़ी काला चावल",
    category: "Rice",
    description: "A premium high-altitude black rice grown organically in select pockets of Uttarakhand. Known as 'forbidden rice' historically because it was reserved for royals due to its high health benefits. It is deeply colored, nutty, and loaded with cell-protecting antioxidants.",
    shortDesc: "Black Rice from Pahadi mountains — once the 'forbidden rice' of royals. Highest antioxidant of all rices.",
    ingredients: "100% organic unpolished black rice.",
    benefits: [
      "Highest antioxidant content of all grains",
      "Rich in anthocyanin pigment for cell protection",
      "Supports heart and eye health",
      "Gluten-free and rich in fiber",
      "Aids in natural detoxification"
    ],
    howToUse: "Soak for 1 hour before cooking. Perfect for preparing traditional rice puddings (kheer), side dishes, or salad bowls.",
    price: 199,
    mrp: 230,
    unit: "500g",
    images: [
      "https://images.unsplash.com/photo-1536304997881-a372c179924b?w=600&q=80",
      "https://images.unsplash.com/photo-1585996388960-496a79854498?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1536304997881-a372c179924b?w=600&q=80",
    tags: ["Black Rice", "Antioxidant Rich", "Superfood Grain", "Rare Harvest"],
    variants: [
      { label: "500g", price: 199, mrp: 230, unit: "500g", stock: 100 },
      { label: "1kg", price: 249, mrp: 290, unit: "1kg", stock: 100 }
    ],
    badge: "NEW",
    stock: 100,
    rating: 4.9,
    reviewCount: 24,
    isActive: true
  },
  {
    name: "Pahadi White Rice (Basmati style)",
    hindiName: "पहाड़ी चावल",
    category: "Rice",
    description: "Fragrant white rice grown in irrigated valleys (Seras) of Uttarakhand. Nourished by cold mountain streams, this long-grain rice has a mild aroma and a delicate texture that makes it perfect for daily meals.",
    shortDesc: "Traditional Pahadi rice from Uttarakhand mountain terraces — fragrant, long-grain, naturally grown.",
    ingredients: "100% pure mountain white rice.",
    benefits: [
      "Naturally fragrant without artificial polish",
      "Nourished by pure mountain water",
      "Light and easy to digest",
      "Provides healthy energy",
      "Perfect staple for everyday meals"
    ],
    howToUse: "Cook like regular basmati rice. Pairs perfectly with Pahadi Bhatt ki Churkani, Gehat Dal, or mountain curries.",
    price: 149,
    mrp: 175,
    unit: "500g",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
      "https://images.unsplash.com/photo-1536304997881-a372c179924b?w=300&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
    tags: ["Basmati Style", "Mountain Rice", "Naturally Grown", "Fragrant Grain"],
    variants: [
      { label: "500g", price: 149, mrp: 175, unit: "500g", stock: 100 },
      { label: "1kg", price: 200, mrp: 240, unit: "1kg", stock: 100 }
    ],
    badge: null,
    stock: 100,
    rating: 4.6,
    reviewCount: 38,
    isActive: true
  }
];

// Helper to extract PRODUCTS array from index.html
const getProductsFromFrontend = () => {
  const indexPath = path.join(__dirname, "../../../himsaru-vercel-deploy (1)/public/index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn(`⚠️ Frontend index.html not found at: ${indexPath}. Using fallback products.`);
    return fallbackProducts;
  }

  try {
    const html = fs.readFileSync(indexPath, "utf8");
    
    // Find const PRODUCTS = [ ... ];
    const startIdx = html.indexOf("const PRODUCTS = [");
    if (startIdx === -1) {
      console.warn("⚠️ Could not find const PRODUCTS array in index.html. Using fallback products.");
      return fallbackProducts;
    }

    // Find the closing ]; of the array
    let bracketCount = 0;
    let endIdx = -1;
    for (let i = startIdx + 17; i < html.length; i++) {
      if (html[i] === "[") bracketCount++;
      if (html[i] === "]") {
        if (bracketCount === 0) {
          endIdx = i;
          break;
        }
        bracketCount--;
      }
    }

    if (endIdx === -1) {
      console.warn("⚠️ Could not find matching closing bracket for PRODUCTS array in index.html. Using fallback products.");
      return fallbackProducts;
    }

    const arrayStr = html.substring(startIdx + 17, endIdx + 1);
    
    // Evaluate the array expression safely
    const rawProducts = new Function(`return [${arrayStr}]`)();

    const catMap = {
      ghee: "A2 Ghee",
      honey: "Wild Honey",
      salt: "Pahadi Salts",
      pulses: "Mountain Pulses",
      rice: "Rice",
      spices: "Spices"
    };

    return rawProducts.map(p => {
      const mainVariant = p.variants[0] || { size: "500g", price: 199, mrp: 199 };
      return {
        name: p.name,
        hindiName: p.hindi || p.name,
        category: catMap[p.cat] || "Other",
        description: p.longDesc || p.desc || "",
        shortDesc: p.desc || "",
        ingredients: p.ing || "",
        benefits: p.ben || [],
        howToUse: p.how || "",
        price: mainVariant.price,
        mrp: mainVariant.mrp || mainVariant.price,
        unit: mainVariant.size || "unit",
        images: p.imgs || [p.img],
        thumbnail: p.img,
        tags: p.tags || [],
        variants: (p.variants || []).map(v => ({
          label: v.size,
          price: v.price,
          mrp: v.mrp || v.price,
          unit: v.size,
          stock: 100
        })),
        badge: p.badge ? p.badge.toUpperCase() : null,
        stock: 100,
        rating: 4.8,
        reviewCount: 15,
        isActive: true
      };
    });
  } catch (err) {
    console.error("❌ Error parsing products from index.html. Using fallback products:", err);
    return fallbackProducts;
  }
};

const seedDatabase = async (forceClear = false) => {
  try {
    const products = getProductsFromFrontend();
    if (!products || products.length === 0) {
      console.log("⚠️ No products retrieved. Seeding skipped.");
      return false;
    }

    if (forceClear) {
      await Product.deleteMany({});
      console.log("Cleared existing products from database.");
      await Product.insertMany(products);
      console.log(`✅ Seeded ${products.length} products successfully!`);
    } else {
      // Smart Sync: Upsert each product by name
      console.log("Performing smart sync of products...");
      let createdCount = 0;
      let updatedCount = 0;
      for (const p of products) {
        const existing = await Product.findOne({ name: p.name });
        if (existing) {
          // Update details to match frontend
          await Product.findByIdAndUpdate(existing._id, p);
          updatedCount++;
        } else {
          // Create new product
          await Product.create(p);
          createdCount++;
        }
      }
      console.log(`✅ Smart sync complete: Created ${createdCount}, Updated ${updatedCount} products.`);

      // Deactivate any products in the database that are not in the current sync list
      const syncedNames = products.map(p => p.name);
      const deactivateResult = await Product.updateMany(
        { name: { $nin: syncedNames }, isActive: true },
        { isActive: false }
      );
      if (deactivateResult.modifiedCount > 0) {
        console.log(`Deactivated ${deactivateResult.modifiedCount} outdated products.`);
      }
    }

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

    return true;
  } catch (err) {
    console.error("❌ Seeding database failed:", err);
    return false;
  }
};

module.exports = {
  getProductsFromFrontend,
  seedDatabase
};
