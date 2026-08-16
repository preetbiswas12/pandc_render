const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // ⚠️ SECURITY: Use env vars for admin credentials in production
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'pandctexfab@gmail.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'preetb121106';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Optionally update password if different
      const updatePassword = process.argv.includes('--reset-password');
      if (updatePassword) {
        existingAdmin.password = adminPassword;
        await existingAdmin.save();
        console.log('✅ Admin password updated');
      } else {
        console.log('ℹ️ Admin already exists. Use --reset-password to update password.');
      }
    } else {
      // Create new admin
      const newAdmin = new Admin({
        email: adminEmail,
        password: adminPassword,
        name: 'Preet Biswas',
        role: 'super-admin',
        permissions: [
          'view-dashboard',
          'manage-products',
          'manage-orders',
          'manage-coupons',
          'manage-banners',
          'manage-categories',
          'manage-users',
        ],
      });

      await newAdmin.save();
      console.log(`✅ Admin user created: ${adminEmail}`);
    }

    console.log('✅ Admin seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
