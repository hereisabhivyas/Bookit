import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/admin.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  try {
    // Connect to MongoDB with database name specified
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/vibeweaver';
    await mongoose.connect(mongoUrl);

    console.log('Connected to database:', mongoose.connection.name);

    const adminEmail = 'admin@bookit.com';
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists. Updating password...');
      
      const salt = bcrypt.genSaltSync(10);
      existingAdmin.password = bcrypt.hashSync('admin123', salt);
      existingAdmin.name = 'Admin User';
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      
      console.log('Admin password updated successfully');
    } else {
      const salt = bcrypt.genSaltSync(10);

      await Admin.create({
        name: 'Admin User',
        email: adminEmail,
        password: bcrypt.hashSync('admin123', salt),
        role: 'admin'
      });

      console.log('Admin created successfully');
    }
    
    console.log('Email:', adminEmail);
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seedAdmin();
