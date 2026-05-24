const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'pandctexfab@gmail.com' });

    if (existingAdmin) {
      // Optionally update password if different
      const updatePassword = process.argv.includes('--reset-password');
      if (updatePassword) {
        existingAdmin.password = 'preetb121106';
        await existingAdmin.save();
      }
    } else {
      // Create new admin
      const newAdmin = new Admin({
        email: 'pandctexfab@gmail.com',
        password: 'preetb121106',
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
    }

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
