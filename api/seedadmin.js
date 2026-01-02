import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/admin.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const salt = bcrypt.genSaltSync(10);

    await Admin.create({
      name: 'Admin User',
      email: 'admin@bookit.com',
      password: bcrypt.hashSync('admin123', salt),
      role: 'admin'
    });

    console.log('Admin created');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAdmin();
