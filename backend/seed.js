const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Product = require('./models/Product');
const Category = require('./models/Category');
const Banner = require('./models/Banner');
const Coupon = require('./models/Coupon');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Banner.deleteMany({});
    await Coupon.deleteMany({});

    console.log('Cleared existing collections.');

    // Seed Categories
    const categories = [
      {
        name: 'Cotton',
        slug: 'cotton',
        subCategories: [
          { name: 'Plain Cotton', slug: 'plain-cotton' },
          { name: 'Printed Cotton', slug: 'printed-cotton' },
          { name: 'Organic Cotton', slug: 'organic-cotton' }
        ],
        isActive: true,
        description: 'Breathable and comfortable cotton fabrics perfect for clothing, home décor, and craft projects'
      },
      {
        name: 'Silk',
        slug: 'silk',
        subCategories: [
          { name: 'Pure Silk', slug: 'pure-silk' },
          { name: 'Silk Blends', slug: 'silk-blends' },
          { name: 'Digital Print Silk', slug: 'digital-print-silk' }
        ],
        isActive: true,
        description: 'Premium silk fabrics known for elegance, smooth texture, and luxurious drape'
      },
      {
        name: 'Linen',
        slug: 'linen',
        subCategories: [
          { name: 'Pure Linen', slug: 'pure-linen' },
          { name: 'Linen Blends', slug: 'linen-blends' }
        ],
        isActive: true,
        description: 'Durable and eco-friendly linen fabrics suitable for apparel and home furnishings'
      },
      {
        name: 'Wool',
        slug: 'wool',
        subCategories: [
          { name: 'Merino Wool', slug: 'merino-wool' },
          { name: 'Cashmere Blends', slug: 'cashmere-blends' }
        ],
        isActive: true,
        description: 'Warm and comfortable wool fabrics for winter garments and cozy home décor'
      }
    ];
    await Category.insertMany(categories);
    console.log('Categories seeded.');

    // Seed Banners
    const banners = [
      {
        type: 'hero-main',
        title: 'Premium Quality\nFabric Supplier',
        subtitle: 'Finest selection of cotton, silk, Linen, Viscose & Printed Fabrics for fashionable and everday garments',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
        link: '/shop',
        buttonText: 'EXPLORE FABRICS',
        isActive: true,
        order: 1
      },
      {
        type: 'hero-side',
        title: 'Handwoven\nCollections',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
        link: '/shop',
        buttonText: 'Shop Now',
        isActive: true,
        order: 2
      },
      {
        type: 'hero-side',
        title: 'Organic &\nSustainable',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
        link: '/shop',
        buttonText: 'Explore',
        isActive: true,
        order: 3
      },
      {
        type: 'casual-inspiration',
        title: 'Digital Print\nFabrics',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
        link: '/shop',
        buttonText: 'Shop Now',
        isActive: true,
        order: 4
      },
      {
        type: 'casual-inspiration',
        title: 'Luxury Silks',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
        link: '/shop',
        buttonText: 'Shop Now',
        isActive: true,
        order: 5
      }
    ];
    await Banner.insertMany(banners);
    console.log('Banners seeded.');

    // Seed Products — initial catalog with realistic data
    const products = [
      {
        sku: 'COT-001',
        name: 'Indigo Handblock Print Cotton',
        price: 350,
        offerPercentage: 10,
        quantity: 500,
        category: 'cotton',
        subCategory: 'printed-cotton',
        fabricType: 'Pure Cotton',
        width: 1.1,
        unit: 'meters',
        careInstructions: 'Gentle hand wash in cold water. Dry in shade to maintain color vibrancy.',
        description: 'Beautiful traditional indigo handblock printed fabric made from 100% pure cotton. Perfect for clothing, home décor, and craft projects. Features authentic artisan prints that add character to any project.',
        images: ['https://images.unsplash.com/photo-1594913785162-e6785b42dfdc?q=80&w=2071'],
        colors: ['Indigo', 'White'],
        features: ['100% Pure Cotton', 'Hand-blocked Prints', 'Breathable & Soft', 'Color-fast Dyes', 'Eco-friendly', 'Skin-friendly']
      },
      {
        sku: 'COT-002',
        name: 'Premium Plain Cotton Canvas',
        price: 250,
        offerPercentage: 0,
        quantity: 800,
        category: 'cotton',
        subCategory: 'plain-cotton',
        fabricType: 'Canvas Cotton',
        width: 1.2,
        unit: 'meters',
        careInstructions: 'Machine wash cold. Tumble dry low.',
        description: 'Versatile plain cotton canvas, ideal for bags, upholstery, and structured garments. Pre-washed for softness and shrinkage control.',
        images: ['https://images.unsplash.com/photo-1596392927852-2a1c43751c47?q=80&w=2070'],
        colors: ['Natural', 'White', 'Black'],
        features: ['Pre-washed', 'Durable', 'Shrinkage Controlled', 'Multi-purpose']
      },
      {
        sku: 'COT-003',
        name: 'Organic Cotton Muslin',
        price: 420,
        offerPercentage: 5,
        quantity: 300,
        category: 'cotton',
        subCategory: 'organic-cotton',
        fabricType: 'Organic Cotton',
        width: 1.1,
        unit: 'meters',
        careInstructions: 'Wash separately in cold water. Line dry.',
        description: 'GOTS-certified organic cotton muslin. Incredibly soft and breathable, perfect for baby clothing, summer dresses, and layering.',
        images: ['https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2070'],
        colors: ['Natural', 'Light Pink', 'Sage'],
        features: ['GOTS Certified', 'Hypoallergenic', 'Ultra Soft', 'Breathable']
      },
      {
        sku: 'SIL-001',
        name: 'Pure Mulberry Silk Charmeuse',
        price: 1800,
        offerPercentage: 15,
        quantity: 150,
        category: 'silk',
        subCategory: 'pure-silk',
        fabricType: 'Mulberry Silk',
        width: 0.9,
        unit: 'meters',
        careInstructions: 'Dry clean only. Store flat or rolled.',
        description: 'Luxurious mulberry silk charmeuse with a satin face and matte back. Ideal for evening wear, blouses, and special occasion garments.',
        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2070'],
        colors: ['Ivory', 'Champagne', 'Midnight Blue'],
        features: ['Grade 6A Silk', 'Satin Finish', 'Natural Temperature Regulation', 'Luxurious Drape']
      },
      {
        sku: 'SIL-002',
        name: 'Digital Print Silk Georgette',
        price: 1200,
        offerPercentage: 10,
        quantity: 200,
        category: 'silk',
        subCategory: 'digital-print-silk',
        fabricType: 'Silk Georgette',
        width: 1.1,
        unit: 'meters',
        careInstructions: 'Dry clean recommended. Steam iron on low.',
        description: 'Lightweight silk georgette with vibrant digital prints. Sheer and flowy, perfect for saris, scarves, and overlay garments.',
        images: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070'],
        colors: ['Multi-color', 'Red', 'Teal'],
        features: ['Digital Print', 'Sheer & Flowy', 'Vibrant Colors', 'Lightweight']
      },
      {
        sku: 'SIL-003',
        name: 'Cotton-Silk Blend Dupioni',
        price: 680,
        offerPercentage: 0,
        quantity: 250,
        category: 'silk',
        subCategory: 'silk-blends',
        fabricType: 'Cotton-Silk Blend',
        width: 1.1,
        unit: 'meters',
        careInstructions: 'Dry clean or gentle hand wash. Cool iron.',
        description: 'A smart blend combining silk sheen with cotton ease of care. Great for semi-formal shirts, dresses, and home décor.',
        images: ['https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2070'],
        colors: ['Peach', 'Dusty Blue', 'Mint'],
        features: ['Easy Care', 'Subtle Sheen', 'Wrinkle Resistant', 'Comfortable']
      },
      {
        sku: 'LIN-001',
        name: 'Pure French Linen',
        price: 780,
        offerPercentage: 0,
        quantity: 400,
        category: 'linen',
        subCategory: 'pure-linen',
        fabricType: 'French Linen',
        width: 1.4,
        unit: 'meters',
        careInstructions: 'Machine wash cold, gentle cycle. Air dry for best results.',
        description: 'Premium French flax linen that gets softer with every wash. Ideal for summer suits, dresses, and sophisticated home textiles.',
        images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070'],
        colors: ['Natural', 'Sky Blue', 'Dusty Rose'],
        features: ['French Flax', 'Gets Softer Over Time', 'Naturally Breathable', 'Eco-friendly']
      },
      {
        sku: 'LIN-002',
        name: 'Cotton-Linen Blend',
        price: 450,
        offerPercentage: 10,
        quantity: 600,
        category: 'linen',
        subCategory: 'linen-blends',
        fabricType: 'Cotton-Linen',
        width: 1.4,
        unit: 'meters',
        careInstructions: 'Machine wash cold. Tumble dry low or line dry.',
        description: 'The perfect blend of cotton comfort and linen character. Less wrinkles than pure linen, great for everyday shirts and trousers.',
        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2070'],
        colors: ['Oat', 'Charcoal', 'Sage'],
        features: ['Soft Hand Feel', 'Easy Care', 'Breathable', 'Versatile']
      },
      {
        sku: 'WOL-001',
        name: 'Merino Wool Jersey',
        price: 950,
        offerPercentage: 5,
        quantity: 200,
        category: 'wool',
        subCategory: 'merino-wool',
        fabricType: 'Merino Wool',
        width: 1.5,
        unit: 'meters',
        careInstructions: 'Hand wash cold. Dry flat. Do not wring.',
        description: 'Ultra-fine merino wool jersey with a soft next-to-skin feel. Perfect for base layers, t-shirts, and lightweight sweaters.',
        images: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070'],
        colors: ['Navy', 'Charcoal', 'Burgundy'],
        features: ['18.5 Micron', 'Temperature Regulating', 'Odor Resistant', 'Machine Washable']
      },
      {
        sku: 'WOL-002',
        name: 'Cashmere Blend Overcoat Fabric',
        price: 2200,
        offerPercentage: 20,
        quantity: 100,
        category: 'wool',
        subCategory: 'cashmere-blends',
        fabricType: 'Wool-Cashmere Blend',
        width: 1.4,
        unit: 'meters',
        careInstructions: 'Dry clean only. Store on padded hanger.',
        description: 'Sumptuous wool-cashmere blend for premium overcoats and blazers. Incredibly warm yet lightweight with a refined finish.',
        images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070'],
        colors: ['Camel', 'Charcoal', 'Black'],
        features: ['30% Cashmere', 'Densely Woven', 'Warm & Lightweight', 'Refined Finish']
      }
    ];
    await Product.insertMany(products);
    console.log(`Products seeded (${products.length} items).`);

    // Seed Coupons
    const coupons = [
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 500,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        usageLimit: 1000,
        isActive: true
      }
    ];
    await Coupon.insertMany(coupons);
    console.log('Coupons seeded.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
