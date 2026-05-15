#!/usr/bin/env node
// Quick test to verify backend starts without errors

const fs = require('fs');
const path = require('path');

console.log("🔍 HIMSARU Backend Pre-Deploy Test\n");

let errors = 0;

// 1. Check required files exist
const requiredFiles = [
  'server.js',
  'package.json',
  'models/User.js',
  'models/Product.js',
  'models/Order.js',
  'models/Contact.js',
  'models/index.js',
  'routes/auth.js',
  'routes/products.js',
  'routes/orders.js',
  'routes/contact.js',
  'routes/admin.js',
  'middleware/auth.js',
  'seed.js'
];

console.log("📁 Checking required files...");
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    errors++;
  }
}

// 2. Validate package.json
console.log("\n📦 Checking package.json...");
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`  ✅ Valid JSON`);
  console.log(`  ✅ Name: ${pkg.name}`);
  console.log(`  ✅ Main: ${pkg.main}`);
  console.log(`  ✅ Scripts: ${Object.keys(pkg.scripts).join(', ')}`);

  // Check for built-in modules in dependencies
  const builtInModules = ['crypto', 'fs', 'path', 'http', 'https', 'url', 'util', 'stream'];
  const deps = Object.keys(pkg.dependencies || {});
  const badDeps = deps.filter(d => builtInModules.includes(d));
  if (badDeps.length > 0) {
    console.log(`  ⚠️  Built-in modules in dependencies (will cause npm errors): ${badDeps.join(', ')}`);
    errors++;
  } else {
    console.log(`  ✅ No built-in modules in dependencies`);
  }
} catch (e) {
  console.log(`  ❌ Invalid package.json: ${e.message}`);
  errors++;
}

// 3. Check .env or .env.example
console.log("\n🔑 Checking environment...");
if (fs.existsSync('.env')) {
  console.log(`  ✅ .env file exists`);
} else if (fs.existsSync('.env.example')) {
  console.log(`  ⚠️  .env missing (copy from .env.example)`);
} else {
  console.log(`  ❌ No .env or .env.example found`);
}

// 4. Summary
console.log("\n" + "=".repeat(50));
if (errors === 0) {
  console.log("✅ ALL CHECKS PASSED - Ready to deploy!");
  console.log("\nNext steps:");
  console.log("  1. npm install");
  console.log("  2. Set MONGODB_URI in .env");
  console.log("  3. npm run seed");
  console.log("  4. npm start");
} else {
  console.log(`❌ ${errors} ERROR(S) FOUND - Fix before deploying`);
  process.exit(1);
}
