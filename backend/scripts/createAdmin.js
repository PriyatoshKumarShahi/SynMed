const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

async function createDefaultAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'priytoshshahi90@gmail.com' });
    if (existingAdmin) {
      console.log('Default admin already exists');
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash('825018', 10);

    // Create default admin
    const defaultAdmin = new Admin({
      name: 'Priyatosh Kumar',
      email: 'priytoshshahi90@gmail.com',
      passwordHash,
      role: 'admin',
      isActive: true
    });

    await defaultAdmin.save();
    console.log('Default admin created successfully');
    console.log('Email: priytoshshahi90@gmail.com');
    console.log('Password: 825018');

  } catch (error) {
    console.error('Error creating default admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createDefaultAdmin();