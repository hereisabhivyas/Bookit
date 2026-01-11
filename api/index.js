// All imports above, only once
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import './models/user.js';
import User from './models/user.js';
import './models/admin.js';
import Admin from './models/admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import HostRequest from './models/hostRequest.js';
import Venue from './models/venue.js';
import Category from './models/category.js';
import Event from './models/event.js';
import Community from './models/community.js';
import Message from './models/message.js';
import CommunityMember from './models/communityMember.js';
import Payment from './models/payment.js';
import { encrypt, decrypt } from './utils/encryption.js';
// Cloudinary cloud storage
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import razorpay, { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from './utils/razorpay.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Validate Cloudinary configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  WARNING: Cloudinary credentials are not fully configured. Image uploads may fail.');
}

// Configure multer for Cloudinary uploads (class API - multer-storage-cloudinary v4)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vibeweaver',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    resource_type: 'auto',
    public_id: (req, file) => {
      const baseName = path.parse(file.originalname || 'upload').name;
      return `${Date.now()}-${baseName}`;
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Normalize incoming images payloads to a clean string array
function normalizeImages(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .filter(Boolean)
      .map((item) => {
        // Handle objects with url/secure_url properties from multer-storage-cloudinary
        if (typeof item === 'object' && (item.url || item.secure_url || item.path)) {
          return item.secure_url || item.url || item.path;
        }
        return String(item);
      })
      .filter((url) => url && url !== '[object Object]');
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// Extract images from common payload keys
function extractImages(body = {}) {
  return normalizeImages(
    body.images || body.imageUrls || body.urls || body.photos || body.pictures
  );
}

const secretKey = bcrypt.genSaltSync(10);
const app = express();
const port = Number(process.env.PORT) || 10000;
const defaultApiUrl = (process.env.API_URL || `http://localhost:${port}`).replace(/\/$/, '');
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Admin token


// Middleware to extract user from JWT token
function getUserFromToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    // Use a real secret in production!
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Admin token middleware - verify JWT
function getAdminFromToken(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.split(' ')[1] : null;
  if (!token) {
    console.warn('[Auth] No admin token provided');
    return res.status(401).json({ error: 'No admin token provided' });
  }
  try {
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, jwtSecret);
    console.log('[Auth] Token decoded:', { email: decoded.email, role: decoded.role });
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      console.warn('[Auth] User is not admin:', { role: decoded.role });
      return res.status(401).json({ error: 'Not an admin' });
    }
    req.adminEmail = decoded.email;
    req.adminRole = decoded.role;
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }
}

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration - default to local development origins
const defaultLocalOrigins = [
  `http://localhost:${port}`,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://localhost', // Capacitor Android serves from http://localhost
  'capacitor://localhost', // Capacitor iOS uses capacitor:// scheme
  'ionic://localhost', // Ionic apps may use ionic:// scheme
];

const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultLocalOrigins, ...extraOrigins])];

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (process.env.NODE_ENV !== 'production') return cb(null, true);
    console.warn(`CORS blocked origin: ${origin}`);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
}));

const mongoUri = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/vibeweaver';

mongoose.connect(mongoUri)
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch(err => {
    console.error('✗ MongoDB connection failed:', err.message);
    console.error('Make sure MONGO_URL environment variable is set correctly');
    process.exit(1);
  });

// Image upload endpoint (requires auth)
app.post('/upload/images', getUserFromToken, (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err.code, err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large (max 10MB)' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files (max 10)' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error('Upload middleware error:', err.message || err);
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Upload request received - files:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    console.log('Processing files:', req.files.map(f => ({ 
      filename: f.filename,
      path: f.path, 
      secure_url: f.secure_url,
      url: f.url
    })));

    // Extract Cloudinary URLs from uploaded files
    // multer-storage-cloudinary v4 stores secure_url in the file object
    const urls = req.files
      .map(file => {
        const url = file.secure_url || file.path || file.url;
        console.log('Extracted URL from file:', { filename: file.filename, url });
        return url;
      })
      .filter(url => url && typeof url === 'string');

    console.log('Final extracted URLs:', urls);

    if (urls.length === 0) {
      console.error('No secure URLs returned from Cloudinary');
      return res.status(500).json({ error: 'Failed to process uploaded files - no URLs returned' });
    }

    res.json({ 
      message: 'Images uploaded successfully', 
      urls,
      files: req.files.map(f => ({
        filename: f.filename,
        url: f.secure_url || f.path || f.url
      }))
    });
  } catch (err) {
    console.error('Error uploading images:', err);
    res.status(500).json({ error: 'Failed to upload images: ' + (err.message || 'Unknown error') });
  }
});

// Save uploaded images to a venue (requires auth and ownership)
app.post('/host/my-requests/:id/add-images', getUserFromToken, async (req, res) => {
  try {
    console.log('Add-images request - venueId:', req.params.id, 'body:', JSON.stringify(req.body));
    
    const { urls } = req.body || {};
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      console.error('Invalid URLs in add-images request:', urls);
      return res.status(400).json({ error: 'Image URLs array is required' });
    }

    console.log('Received URLs to save:', urls);

    const venue = await HostRequest.findOne({ 
      _id: req.params.id, 
      submittedByEmail: req.userEmail 
    });
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found or unauthorized' });
    }

    // Normalize incoming URLs and add to existing images
    const cleanUrls = normalizeImages(urls);
    console.log('Normalized URLs:', cleanUrls);
    
    const existingImages = Array.isArray(venue.images) ? venue.images : [];
    console.log('Existing images:', existingImages);
    
    venue.images = [...existingImages, ...cleanUrls];
    console.log('Final images array to save:', venue.images);

    const saved = await venue.save();
    console.log('Saved venue with images:', saved.images);

    // Sync to public venue if approved
    try {
      const publicVenue = await Venue.findOne({ hostRequestId: venue._id });
      if (publicVenue) {
        publicVenue.images = venue.images;
        await publicVenue.save();
      }
    } catch (syncErr) {
      console.warn('Warning syncing to public Venue:', syncErr?.message);
    }

    // Verify saved data
    const verified = await HostRequest.findById(req.params.id);
    console.log('Verified saved images:', verified.images);

    res.json({ 
      message: 'Images added successfully', 
      images: verified.images,
      count: cleanUrls.length
    });
  } catch (err) {
    console.error('Error adding images to venue:', err);
    res.status(500).json({ error: 'Failed to add images: ' + err.message });
  }
});

// Save uploaded images to an event (requires auth and ownership)
app.post('/host/my-events/:id/add-images', getUserFromToken, async (req, res) => {
  try {
    console.log('Add-images request (event) - eventId:', req.params.id, 'body:', JSON.stringify(req.body));
    
    const { urls } = req.body || {};
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      console.error('Invalid URLs in add-images request:', urls);
      return res.status(400).json({ error: 'Image URLs array is required' });
    }

    console.log('Received URLs to save:', urls);

    const event = await Event.findOne({ 
      _id: req.params.id, 
      createdBy: req.userEmail 
    });
    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    // Normalize incoming URLs and add to existing images
    const cleanUrls = normalizeImages(urls);
    console.log('Normalized URLs:', cleanUrls);
    
    const existingImages = Array.isArray(event.images) ? event.images : [];
    console.log('Existing images:', existingImages);
    
    event.images = [...existingImages, ...cleanUrls];
    console.log('Final images array to save:', event.images);

    // Update cover image if not set
    if (!event.image && cleanUrls.length > 0) {
      event.image = cleanUrls[0];
    }

    const saved = await event.save();
    console.log('Saved event with images:', saved.images);

    // Verify saved data
    const verified = await Event.findById(req.params.id);
    console.log('Verified saved images:', verified.images);

    res.json({ 
      message: 'Images added successfully', 
      images: verified.images,
      coverImage: verified.image,
      count: cleanUrls.length
    });
  } catch (err) {
    console.error('Error adding images to event:', err);
    res.status(500).json({ error: 'Failed to add images: ' + err.message });
  }
  });



// Socket.IO: authenticate and join community rooms
io.on('connection', (socket) => {
  socket.on('join-community', async ({ communityId, token }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      const email = decoded.email;
      const community = await Community.findById(communityId);
      if (!community) {
        return socket.emit('error', { message: 'Community not found' });
      }
      // Allow creator or active members
      const isCreator = community.createdBy === email;
      const membership = await CommunityMember.findOne({
        communityId,
        userEmail: email,
        status: 'active'
      });
      if (!isCreator && !membership) {
        return socket.emit('error', { message: 'Not a member of this community' });
      }
      socket.join(String(communityId));
      socket.emit('joined', { communityId });
    } catch (err) {
      socket.emit('error', { message: 'Invalid or expired token' });
    }
  });
});

app.get('/test', (req, res) => {
  res.json('Hello World!');
});

// Auth endpoints
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Fetch user from MongoDB
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Credentials do not match. Please try again.' });
      }
      // Compare password
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Credentials do not match. Please try again.' });
      }
      // Success: create JWT token
      const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
      const token = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: '1d' });
      return res.json({
        token,
        user: { name: user.name, email: user.email },
        message: 'Logged in successfully'
      });
    })
    .catch((err) => {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Login failed. Please try again later.' });
    });
});

app.post('/auth/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  // Save user to MongoDB
  User.create({
    name,
    email,
    password: bcrypt.hashSync(password, secretKey)
  })
    .then((user) => {
      const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
      const token = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: '1d' });
      return res.status(201).json({
        token,
        user: { name: user.name, email: user.email },
        message: 'Account created successfully'
      });
    })
    .catch((err) => {
      console.error('Error creating user:', err);
      // Handle duplicate email error
      if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
        return res.status(409).json({
          error: 'User already exists. Please login instead.'
        });
      }
      return res.status(500).json({ error: 'Failed to create user' });
    });
});

// Google OAuth endpoint
app.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Fetch user info from Google using the access token
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );
    
    if (!userInfoResponse.ok) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const googleUser = await userInfoResponse.json();
    const { email, name } = googleUser;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user with Google account
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), secretKey) // Random password for Google users
      });
    }

    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const jwtToken = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: '1d' });
    
    return res.json({
      token: jwtToken,
      user: { name: user.name, email: user.email },
      message: 'Logged in with Google successfully'
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Get user profile endpoint
app.get('/auth/profile', getUserFromToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Map DB fields to profile fields expected by frontend
    const [firstName, ...lastNameParts] = (user.name || '').split(' ');
    const lastName = lastNameParts.join(' ');
    res.json({
      user: {
        firstName: firstName || '',
        lastName: lastName || '',
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        profileImage: user.profileImage || ''
      },
      settings: user.settings || {}
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile endpoint
app.put('/auth/profile', getUserFromToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, location, bio, profileImage, profileImageUrl } = req.body;
    
    // Extract image from various possible payload keys
    const imageToSave = profileImage || profileImageUrl || extractImages(req.body)[0];
    
    const user = await User.findOneAndUpdate(
      { email: req.userEmail },
      {
        name: `${firstName} ${lastName}`.trim(),
        phone,
        location,
        bio,
        profileImage: imageToSave || undefined
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const [firstName_new, ...lastNameParts] = (user.name || '').split(' ');
    const lastName_new = lastNameParts.join(' ');
    res.json({
      user: {
        firstName: firstName_new || '',
        lastName: lastName_new || '',
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        profileImage: user.profileImage || ''
      },
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update user settings endpoint
app.put('/auth/settings', getUserFromToken, async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, eventReminders, communityUpdates, weeklyDigest, darkMode } = req.body;
    const user = await User.findOneAndUpdate(
      { email: req.userEmail },
      {
        settings: {
          emailNotifications,
          pushNotifications,
          eventReminders,
          communityUpdates,
          weeklyDigest,
          darkMode
        }
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      settings: user.settings || {},
      message: 'Settings updated successfully'
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Update password
app.put('/auth/password', getUserFromToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({ email: req.userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = bcrypt.hashSync(newPassword, secretKey);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'API is running', version: '1.0' });
});

// Delete account and all user data
app.delete('/auth/account', getUserFromToken, async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await User.findOne({ email: req.userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    const result = await User.deleteOne({ email: req.userEmail });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If there were other collections related to the user, they'd be deleted here.

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Save host registration (requires auth)
app.post('/host/requests', getUserFromToken, async (req, res) => {
  try {
    const {
      venueName,
      businessType,
      contactPerson,
      email,
      phone,
      address,
      city,
      mapLink,
      website,
      description,
      images,
      imageUrls,
      urls,
      photos,
      pictures
    } = req.body || {};

    // Basic validation
    if (
      !venueName || !businessType || !contactPerson ||
      !email || !phone || !address || !city || !description
    ) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    const record = await HostRequest.create({
      venueName,
      businessType,
      contactPerson,
      email,
      phone,
      address,
      city,
      mapLink: mapLink || '',
      website: website || '',
      description,
      images: extractImages({ images, imageUrls, urls, photos, pictures }),
      status: 'pending',
      submittedByEmail: req.userEmail,
    });

    return res.status(201).json({
      id: record._id,
      message: 'Host registration submitted successfully',
    });
  } catch (err) {
    console.error('Error submitting host request:', err);
    return res.status(500).json({ error: 'Failed to submit host registration' });
  }
});

// Submit an event registration (requires auth)
app.post('/host/events', getUserFromToken, async (req, res) => {
  try {
    const { title, category, location, mapLink, date, startTime, endTime, description, capacity, price, image, images, imageUrls, urls, photos, pictures } = req.body;
    
    if (!title || !category || !location || !date || !description) {
      return res.status(400).json({ error: 'Missing required event fields' });
    }

    const incomingImages = extractImages({ images, imageUrls, urls, photos, pictures });

    const event = new Event({
      title,
      category,
      location,
      mapLink: mapLink || '',
      date,
      startTime: startTime || '',
      endTime: endTime || '',
      description,
      capacity: capacity ? parseInt(capacity) : 0,
      price: price ? parseFloat(price) : 0,
      image: incomingImages[0] || image || '',
      images: incomingImages,
      status: 'pending',
      createdBy: req.userEmail
    });

    await event.save();

    return res.status(201).json({
      id: event._id,
      message: 'Event submitted successfully',
    });
  } catch (err) {
    console.error('Error submitting event:', err);
    return res.status(500).json({ error: 'Failed to submit event' });
  }
});

// Get user's approved venues (requires auth)
app.get('/host/my-requests', getUserFromToken, async (req, res) => {
  try {
    const venues = await HostRequest.find({ 
      submittedByEmail: req.userEmail,
      status: 'approved'
    }).sort({ createdAt: -1 });
    res.json(venues);
  } catch (err) {
    console.error('Error fetching user venues:', err);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

// Get user's approved events (requires auth)
app.get('/host/my-events', getUserFromToken, async (req, res) => {
  try {
    const events = await Event.find({ 
      createdBy: req.userEmail,
      status: 'approved'
    }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error('Error fetching user events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single venue by ID (requires auth and ownership)
app.get('/host/my-requests/:id', getUserFromToken, async (req, res) => {
  try {
    const venue = await HostRequest.findOne({ 
      _id: req.params.id,
      submittedByEmail: req.userEmail 
    });
    if (!venue) return res.status(404).json({ error: 'Venue not found or unauthorized' });
    res.json(venue);
  } catch (err) {
    console.error('Error fetching venue:', err);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
});

// Get single event by ID (requires auth and ownership)
app.get('/host/my-events/:id', getUserFromToken, async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id,
      createdBy: req.userEmail 
    });
    if (!event) return res.status(404).json({ error: 'Event not found or unauthorized' });
    res.json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Update venue (requires auth and ownership)
app.put('/host/my-requests/:id', getUserFromToken, async (req, res) => {
  try {
    const venue = await HostRequest.findOne({ 
      _id: req.params.id,
      submittedByEmail: req.userEmail 
    });
    if (!venue) return res.status(404).json({ error: 'Venue not found or unauthorized' });

    // Update allowed fields (seats handled with merge below)
    const allowedFields = [
      'venueName', 'businessType', 'contactPerson', 'email', 'phone',
      'address', 'city', 'mapLink', 'website', 'description', 'capacity', 
      'amenities', 'pricePerHour', 'images', 'availabilitySlots'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        venue[field] = field === 'images' ? extractImages(req.body) : req.body[field];
      }
    });

    // Merge seats: keep user bookings from public Venue, allow owner to add/remove their own bookings
    const incomingSeats = Array.isArray(req.body.seats) ? req.body.seats : venue.seats || [];
    let mergedSeats = incomingSeats;

    try {
      const publicVenue = await Venue.findOne({ hostRequestId: venue._id });
      if (publicVenue) {
        const maxSeats = Math.max(
          venue.capacity || 0,
          incomingSeats.length,
          (publicVenue.seats || []).length
        );
        mergedSeats = Array.from({ length: maxSeats }, (_, idx) => {
          const seatId = idx + 1;
          const incomingSeat = incomingSeats.find((s) => s.id === seatId) || { id: seatId, label: '', bookings: [] };
          const publicSeat = (publicVenue.seats || []).find((s) => s.id === seatId) || { id: seatId, label: '', bookings: [] };

          const userBookings = (publicSeat.bookings || []).filter((b) => b && b.createdBy === 'user');
          const ownerBookings = (incomingSeat.bookings || []).filter((b) => !b.createdBy || b.createdBy === 'owner');

          return {
            id: seatId,
            label: incomingSeat.label ?? publicSeat.label ?? '',
            price: incomingSeat.price ?? publicSeat.price ?? venue.pricePerHour ?? 0,
            bookings: [...userBookings, ...ownerBookings],
          };
        });

        venue.seats = mergedSeats;
        publicVenue.seats = mergedSeats;

        // Keep mapLink in sync as well
        publicVenue.mapLink = venue.mapLink || publicVenue.mapLink || '';

        await publicVenue.save();
      } else {
        // No public venue yet; just apply incoming seats
        venue.seats = mergedSeats;
      }
    } catch (syncErr) {
      console.warn('Warning syncing Venue from HostRequest:', syncErr?.message || syncErr);
    }

    await venue.save();
    res.json({ message: 'Venue updated successfully', venue });
  } catch (err) {
    console.error('Error updating venue:', err);
    res.status(500).json({ error: 'Failed to update venue' });
  }
});

// Delete a single image from a host request and sync to public Venue (requires auth & ownership)
app.delete('/host/my-requests/:id/images', getUserFromToken, async (req, res) => {
  try {
    const { url, index } = req.body || {};
    if (!url && (index === undefined || index === null)) {
      return res.status(400).json({ error: 'Provide image url or index to delete' });
    }

    // Verify ownership
    const venue = await HostRequest.findOne({ _id: req.params.id, submittedByEmail: req.userEmail });
    if (!venue) return res.status(404).json({ error: 'Venue not found or unauthorized' });

    const images = Array.isArray(venue.images) ? [...venue.images] : [];
    let removedUrl = url;
    if (removedUrl) {
      const beforeLen = images.length;
      venue.images = images.filter((u) => String(u) !== String(removedUrl));
      if (beforeLen === venue.images.length) {
        return res.status(404).json({ error: 'Image not found in venue' });
      }
    } else {
      const idx = parseInt(index, 10);
      if (Number.isNaN(idx) || idx < 0 || idx >= images.length) {
        return res.status(400).json({ error: 'Invalid image index' });
      }
      removedUrl = images[idx];
      images.splice(idx, 1);
      venue.images = images;
    }

    // Persist HostRequest change
    await venue.save();

    // Best-effort sync to public Venue
    try {
      const publicVenue = await Venue.findOne({ hostRequestId: venue._id });
      if (publicVenue) {
        publicVenue.images = venue.images;
        await publicVenue.save();
      }
    } catch (syncErr) {
      console.warn('Warning syncing public Venue images:', syncErr?.message || syncErr);
    }

    // Best-effort: delete local file if it belongs to our uploads folder
    try {
      const prefix = `${defaultApiUrl}/assets/uploads/`;
      if (removedUrl && String(removedUrl).startsWith(prefix)) {
        const filename = String(removedUrl).slice(prefix.length);
        const pathModule = await import('path');
        const fsModule = await import('fs');
        const { fileURLToPath } = await import('url');
        const uploadDir = pathModule.join(pathModule.dirname(fileURLToPath(import.meta.url)), 'Assets', 'uploads');
        const filePath = pathModule.join(uploadDir, filename);
        if (fsModule.existsSync(filePath)) {
          fsModule.unlink(filePath, (err) => {
            if (err) console.warn('Failed to delete image file:', filePath, err?.message || err);
          });
        }
      }
    } catch (fileErr) {
      console.warn('Warning deleting image file:', fileErr?.message || fileErr);
    }

    return res.json({ message: 'Image deleted', images: venue.images });
  } catch (err) {
    console.error('Error deleting image:', err);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Update event (requires auth and ownership)
app.put('/host/my-events/:id', getUserFromToken, async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id,
      createdBy: req.userEmail 
    });
    if (!event) return res.status(404).json({ error: 'Event not found or unauthorized' });

    // Update allowed fields
    const allowedFields = [
      'title', 'category', 'location', 'mapLink', 'date', 'startTime', 'endTime',
      'description', 'capacity', 'price', 'ticketsAvailable', 'venue',
      'amenities', 'images'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = field === 'images' ? extractImages(req.body) : req.body[field];
      }
    });

    await event.save();
    res.json({ message: 'Event updated successfully', event });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete a single image from an event (requires auth & ownership)
app.delete('/host/my-events/:id/images', getUserFromToken, async (req, res) => {
  try {
    const { url, index } = req.body || {};
    if (!url && (index === undefined || index === null)) {
      return res.status(400).json({ error: 'Provide image url or index to delete' });
    }

    const event = await Event.findOne({ _id: req.params.id, createdBy: req.userEmail });
    if (!event) return res.status(404).json({ error: 'Event not found or unauthorized' });

    const images = Array.isArray(event.images) ? [...event.images] : [];
    let removedUrl = url;
    if (removedUrl) {
      const beforeLen = images.length;
      event.images = images.filter((u) => String(u) !== String(removedUrl));
      if (beforeLen === event.images.length) {
        return res.status(404).json({ error: 'Image not found in event' });
      }
    } else {
      const idx = parseInt(index, 10);
      if (Number.isNaN(idx) || idx < 0 || idx >= images.length) {
        return res.status(400).json({ error: 'Invalid image index' });
      }
      removedUrl = images[idx];
      images.splice(idx, 1);
      event.images = images;
    }

    await event.save();

    // Best-effort: delete local file if it belongs to our uploads folder
    try {
      const prefix = `${defaultApiUrl}/assets/uploads/`;
      if (removedUrl && String(removedUrl).startsWith(prefix)) {
        const filename = String(removedUrl).slice(prefix.length);
        const pathModule = await import('path');
        const fsModule = await import('fs');
        const { fileURLToPath } = await import('url');
        const uploadDir = pathModule.join(pathModule.dirname(fileURLToPath(import.meta.url)), 'Assets', 'uploads');
        const filePath = pathModule.join(uploadDir, filename);
        if (fsModule.existsSync(filePath)) {
          fsModule.unlink(filePath, (err) => {
            if (err) console.warn('Failed to delete event image file:', filePath, err?.message || err);
          });
        }
      }
    } catch (fileErr) {
      console.warn('Warning deleting event image file:', fileErr?.message || fileErr);
    }

    return res.json({ message: 'Event image deleted', images: event.images });
  } catch (err) {
    console.error('Error deleting event image:', err);
    return res.status(500).json({ error: 'Failed to delete event image' });
  }
});

// Delete venue (requires auth and ownership)
app.delete('/host/my-requests/:id', getUserFromToken, async (req, res) => {
  try {
    const venue = await HostRequest.findOneAndDelete({ 
      _id: req.params.id,
      submittedByEmail: req.userEmail 
    });
    if (!venue) return res.status(404).json({ error: 'Venue not found or unauthorized' });
    // Cascade delete public Venue documents linked to this host request
    try {
      const deletedPublic = await Venue.deleteMany({ hostRequestId: req.params.id });
      console.log('Cascade: deleted public Venue docs:', deletedPublic?.deletedCount || 0);
    } catch (cascadeErr) {
      console.warn('Cascade delete failed for public Venue:', cascadeErr);
    }
    res.json({ message: 'Venue deleted successfully' });
  } catch (err) {
    console.error('Error deleting venue:', err);
    res.status(500).json({ error: 'Failed to delete venue' });
  }
});

// Delete event (requires auth and ownership)
app.delete('/host/my-events/:id', getUserFromToken, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ 
      _id: req.params.id,
      createdBy: req.userEmail 
    });
    if (!event) return res.status(404).json({ error: 'Event not found or unauthorized' });
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// List all host requests (Admin)
app.get('/admin/host/requests', getAdminFromToken, async (req, res) => {
  try {
    const list = await HostRequest.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch host requests' });
  }
});

// Update host request status (Admin)
app.put('/admin/host/requests/:id/status', getAdminFromToken, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const doc = await HostRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Request not found' });

    if (status === 'approved') {
      await Venue.findOneAndUpdate(
        { hostRequestId: doc._id },
        {
          hostRequestId: doc._id,
          venueName: doc.venueName,
          businessType: doc.businessType,
          contactPerson: doc.contactPerson,
          email: doc.email,
          phone: doc.phone,
          address: doc.address,
          city: doc.city,
          mapLink: doc.mapLink || '',
          website: doc.website,
          description: doc.description,
          status: doc.status,
          submittedByEmail: doc.submittedByEmail,
          capacity: doc.capacity,
          amenities: doc.amenities,
          pricePerHour: doc.pricePerHour,
          images: doc.images,
          seats: doc.seats,
          availabilitySlots: doc.availabilitySlots
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      await Venue.deleteOne({ hostRequestId: doc._id });
    }

    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// List all pending events (Admin)
app.get('/admin/events', getAdminFromToken, async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 });
    res.json(events);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Update event status (Admin)
app.put('/admin/events/:id/status', getAdminFromToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const doc = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Event not found' });
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete an event (Admin)
app.delete('/admin/events/:id', getAdminFromToken, async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (e) {
    console.error('Failed to delete event:', e);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// List all users (Admin)
app.get('/admin/users', getAdminFromToken, async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, email: 1, createdAt: 1, settings: 1 }).sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    console.error('Failed to fetch users:', e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete a user (Admin)
app.delete('/admin/users/:id', getAdminFromToken, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    // TODO: cascade deletes for related collections if needed
    res.json({ message: 'User deleted' });
  } catch (e) {
    console.error('Failed to delete user:', e);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete a host request / venue (Admin)
app.delete('/admin/host/requests/:id', getAdminFromToken, async (req, res) => {
  try {
    const deleted = await HostRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Venue not found' });
    // Cascade delete public Venue documents linked to this host request
    try {
      const deletedPublic = await Venue.deleteMany({ hostRequestId: req.params.id });
      console.log('Admin cascade: deleted public Venue docs:', deletedPublic?.deletedCount || 0);
    } catch (cascadeErr) {
      console.warn('Admin cascade: failed to delete public Venue:', cascadeErr);
    }
    res.json({ message: 'Venue deleted' });
  } catch (e) {
    console.error('Failed to delete venue:', e);
    res.status(500).json({ error: 'Failed to delete venue' });
  }
});

// Admin login
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    console.log('[Admin Login] Attempting login for:', email);
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('[Admin Login] Admin not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch) {
      console.log('[Admin Login] Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    console.log('[Admin Login] Generating token with role:', admin.role);
    const token = jwt.sign(
      { email: admin.email, role: admin.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('[Admin Login] Login successful for:', email);
    res.json({
      token,
      admin: { name: admin.name, email: admin.email, role: admin.role },
      message: 'Admin logged in successfully'
    });
  } catch (err) {
    console.error('Error during admin login:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Add this endpoint to api/index.js before app.listen()
app.get('/admin/dashboard/stats', getAdminFromToken, async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get active venues (approved host requests)
    const activeVenues = await HostRequest.countDocuments({ status: 'approved' });
    
    // Get pending requests
    const pendingRequests = await HostRequest.countDocuments({ status: 'pending' });
    
    // For now, we'll use 0 for total events since there's no Event model yet
    const totalEvents = 0;
    
    // Get recent users (last 4)
    const recentUsers = await User.find({}, { name: 1, email: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(4);
    
    // Get pending host requests (last 4)
    const pendingHostRequests = await HostRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(4);
    
    res.json({
      stats: {
        totalUsers,
        activeVenues,
        pendingRequests,
        totalEvents
      },
      recentUsers,
      pendingHostRequests
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Admin: Get all bookings across the platform
app.get('/admin/bookings/all', getAdminFromToken, async (req, res) => {
  try {
    const bookings = [];

    // Fetch all venue bookings
    const venues = await Venue.find({ 
      seats: { $elemMatch: { bookings: { $ne: [] } } } 
    });

    for (const venue of venues) {
      for (const seat of venue.seats || []) {
        const allBookings = (seat.bookings || []).filter(b => b && b.createdByEmail);
        
        for (const booking of allBookings) {
          let bookedAtIso = new Date().toISOString();
          if (booking.date) {
            try {
              const base = `${booking.date}T${(booking.startTime || '00:00').padStart(5, '0')}:00Z`;
              const d = new Date(base);
              if (!isNaN(d.getTime())) bookedAtIso = d.toISOString();
            } catch {}
          }

          const seatPrice = seat.price ?? venue.pricePerHour ?? 0;
          bookings.push({
            type: 'venue',
            venueId: venue._id,
            venueName: venue.venueName,
            seatId: seat.id,
            seatLabel: seat.label || '',
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            hours: booking.hours || 1,
            pricePerHour: seatPrice,
            totalPrice: seatPrice * (booking.hours || 1),
            address: venue.address,
            city: venue.city,
            userEmail: booking.createdByEmail,
            bookingType: booking.createdBy || 'user',
            bookedAt: bookedAtIso,
          });
        }
      }
    }

    // Fetch all event bookings
    const events = await Event.find({ 
      status: 'approved',
      bookings: { $ne: [] }
    });

    for (const event of events) {
      const allBookings = (event.bookings || []).filter(b => b && b.userEmail);
      
      for (const booking of allBookings) {
        bookings.push({
          type: 'event',
          eventId: event._id,
          eventTitle: event.title,
          quantity: booking.quantity || 1,
          pricePerTicket: event.price || 0,
          totalPrice: (event.price || 0) * (booking.quantity || 1),
          date: event.date,
          startTime: event.startTime || '',
          endTime: event.endTime || '',
          location: event.location,
          venue: event.venue || '',
          userEmail: booking.userEmail,
          userName: booking.userName || '',
          bookedAt: (booking.bookedAt && !isNaN(new Date(booking.bookedAt).getTime()))
            ? new Date(booking.bookedAt).toISOString()
            : new Date().toISOString(),
        });
      }
    }

    // Sort by booking date (most recent first)
    bookings.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

    // Calculate summary statistics
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const venueBookings = bookings.filter(b => b.type === 'venue').length;
    const eventBookings = bookings.filter(b => b.type === 'event').length;
    const uniqueUsers = new Set(bookings.map(b => b.userEmail)).size;

    res.json({
      bookings,
      summary: {
        totalBookings: bookings.length,
        totalRevenue,
        venueBookings,
        eventBookings,
        uniqueUsers
      }
    });
  } catch (err) {
    console.error('Error fetching admin booking history:', err);
    res.status(500).json({ error: 'Failed to fetch bookings', details: err?.message || 'Unknown error' });
  }
});

// Admin: Payment history
app.get('/admin/payments', getAdminFromToken, async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 }).limit(200);

    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPayments = payments.length;
    const captured = payments.filter((p) => ['captured', 'paid'].includes((p.status || '').toLowerCase())).length;
    const failed = payments.filter((p) => (p.status || '').toLowerCase() === 'failed').length;

    res.json({
      payments,
      summary: {
        totalPayments,
        totalAmount,
        captured,
        failed,
      },
    });
  } catch (err) {
    console.error('Error fetching admin payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments', details: err?.message || 'Unknown error' });
  }
});

// Admin: Communities management
app.get('/admin/communities', getAdminFromToken, async (req, res) => {
  try {
    const communities = await Community.find({}).sort({ createdAt: -1 });
    res.json(communities);
  } catch (err) {
    console.error('Error fetching communities (admin):', err);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

app.get('/admin/communities/:id/members', getAdminFromToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found' });
    const members = await CommunityMember.find({ communityId: req.params.id }).sort({ role: -1, createdAt: -1 });
    res.json(members);
  } catch (err) {
    console.error('Error fetching community members (admin):', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

app.delete('/admin/communities/:id', getAdminFromToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    await CommunityMember.deleteMany({ communityId: req.params.id });
    await Message.deleteMany({ communityId: req.params.id });
    await Community.findByIdAndDelete(req.params.id);

    res.json({ message: 'Community deleted' });
  } catch (err) {
    console.error('Error deleting community (admin):', err);
    res.status(500).json({ error: 'Failed to delete community' });
  }
});

app.delete('/admin/communities/:id/members/:memberEmail', getAdminFromToken, async (req, res) => {
  try {
    const communityId = req.params.id;
    const memberEmail = req.params.memberEmail;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const memberDoc = await CommunityMember.findOne({ communityId, userEmail: memberEmail });
    if (!memberDoc) return res.status(404).json({ error: 'Member not found' });

    const wasActive = memberDoc.status === 'active';
    await CommunityMember.deleteOne({ communityId, userEmail: memberEmail });

    if (wasActive) {
      await Community.findByIdAndUpdate(communityId, { $inc: { members: -1 } });
    }

    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error('Error removing member (admin):', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Public endpoints for fetching categories, events, and communities
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create Razorpay order (requires auth)
app.post('/payments/order', getUserFromToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body || {};
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) {
      return res.status(400).json({ error: 'Valid amount (in paise) is required' });
    }

    const order = await razorpay.orders.create({
      amount: amt,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: { email: req.userEmail, ...notes },
    });
    res.json({ order, keyId: RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify Razorpay signature post-payment
app.post('/payments/verify', getUserFromToken, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body || {};
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'orderId, paymentId and signature are required' });
    }

    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const verified = expected === signature;
    if (!verified) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const orderInfo = await razorpay.orders.fetch(orderId).catch(() => null);
    const paymentInfo = await razorpay.payments.fetch(paymentId).catch(() => null);

    const paymentRecord = await Payment.findOneAndUpdate(
      { orderId },
      {
        paymentId,
        signature,
        amount: orderInfo ? ((orderInfo.amount_paid ?? orderInfo.amount ?? 0) / 100) : 0,
        currency: orderInfo?.currency || 'INR',
        status: paymentInfo?.status || 'captured',
        email: paymentInfo?.email || req.userEmail || '',
        method: paymentInfo?.method || '',
        contact: paymentInfo?.contact || '',
        notes: orderInfo?.notes || {},
        capturedAt: paymentInfo?.created_at ? new Date(paymentInfo.created_at * 1000) : new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ verified: true, payment: paymentRecord });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Public endpoint: get single event by id
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.status !== 'approved') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Public endpoint for approved venues
app.get('/api/venues', async (req, res) => {
  try {
    const venues = await Venue.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(venues);
  } catch (err) {
    console.error('Error fetching venues:', err);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

// Public endpoint: get single venue by id
app.get('/api/venues/:id', async (req, res) => {
  try {
    let venue = await Venue.findById(req.params.id);
    if (!venue || venue.status !== 'approved') {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Always sync with HostRequest if available to get latest data
    if (venue.hostRequestId) {
      const hostReq = await HostRequest.findById(venue.hostRequestId);
      if (hostReq) {
        const mergedSeats = hostReq.seats && hostReq.seats.length ? hostReq.seats : venue.seats;
        const mergedCapacity = hostReq.capacity && hostReq.capacity > 0 ? hostReq.capacity : venue.capacity;
        const mergedPrice = hostReq.pricePerHour ?? venue.pricePerHour;
        const mergedImages = hostReq.images && hostReq.images.length ? hostReq.images : venue.images;
        const mergedDescription = hostReq.description || venue.description;
        const mergedWebsite = hostReq.website || venue.website;
        const mergedAddress = hostReq.address || venue.address;
        const mergedCity = hostReq.city || venue.city;
        const mergedMapLink = hostReq.mapLink || venue.mapLink;
        const mergedBusinessType = hostReq.businessType || venue.businessType;
        const mergedAmenities = hostReq.amenities || venue.amenities;

        // update in-memory response
        venue = venue.toObject();
        venue.seats = mergedSeats || [];
        venue.capacity = mergedCapacity || 0;
        venue.pricePerHour = mergedPrice;
        venue.images = mergedImages || [];
        venue.description = mergedDescription || '';
        venue.website = mergedWebsite || '';
        venue.address = mergedAddress || '';
        venue.city = mergedCity || '';
        venue.mapLink = mergedMapLink || '';
        venue.businessType = mergedBusinessType || venue.businessType;
        venue.amenities = mergedAmenities || venue.amenities;

        // best-effort persist to keep documents in sync
        await Venue.findByIdAndUpdate(req.params.id, {
          seats: venue.seats,
          capacity: venue.capacity,
          pricePerHour: venue.pricePerHour,
          images: venue.images,
          description: venue.description,
          website: venue.website,
          address: venue.address,
          city: venue.city,
          mapLink: venue.mapLink,
          businessType: venue.businessType,
          amenities: venue.amenities,
        });
      }
    }
    res.json(venue);
  } catch (err) {
    console.error('Error fetching venue:', err);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
});

// Book seats at a venue (requires auth)
app.post('/api/venues/:id/book-seats', getUserFromToken, async (req, res) => {
  try {
    const { date, startTime, hours, seatIds } = req.body || {};
    if (!date || !startTime || typeof hours !== 'number' || hours <= 0 || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: 'date, startTime, positive hours, and seatIds are required' });
    }

    // Compute endTime from startTime + hours (allowing cross-midnight bookings)
    const [sh, sm] = String(startTime).split(':').map((x) => parseInt(x, 10));
    const startMin = sh * 60 + (sm || 0);
    const endMin = startMin + (hours * 60);
    const eh = Math.floor(endMin / 60) % 24;
    const em = endMin % 60;
    const endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    const venue = await Venue.findById(req.params.id);
    if (!venue || venue.status !== 'approved') {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const toMinutes = (t) => {
      const [h, m] = String(t).split(':').map((x) => parseInt(x, 10));
      return h * 60 + (m || 0);
    };
    const sMin = toMinutes(startTime);
    const eMin = startMin + (hours * 60); // Use raw minutes to handle cross-midnight
    if (isNaN(sMin) || isNaN(eMin) || hours <= 0) {
      return res.status(400).json({ error: 'Invalid time range' });
    }

    // Ensure seats exists
    venue.seats = venue.seats || Array.from({ length: venue.capacity || 0 }, (_, i) => ({ id: i + 1, label: '', bookings: [] }));

    // Check availability for each requested seat
    const unavailable = [];
    for (const seatId of seatIds) {
      const seat = venue.seats.find((s) => s.id === seatId);
      if (!seat) {
        unavailable.push({ seatId, reason: 'Seat not found' });
        continue;
      }
      const conflicts = (seat.bookings || []).some((b) => {
        if (!b || !b.date || !b.startTime || !b.endTime) return false;
        if (String(b.date) !== String(date)) return false;
        const bs = toMinutes(b.startTime);
        const bEnd = bs + ((b.hours || 1) * 60); // Calculate end in raw minutes
        // overlap if ranges intersect (handling cross-midnight)
        return sMin < bEnd && bs < eMin;
      });
      if (conflicts) {
        unavailable.push({ seatId, reason: 'Seat already booked for selected time' });
      }
    }

    if (unavailable.length > 0) {
      return res.status(409).json({ error: 'Some seats are unavailable', details: unavailable });
    }

    // Add bookings (tagged as user-created)
    for (const seatId of seatIds) {
      const seat = venue.seats.find((s) => s.id === seatId);
      if (!seat.bookings) seat.bookings = [];
      seat.bookings.push({
        date,
        startTime,
        endTime,
        hours,
        createdBy: 'user',
        createdByEmail: req.userEmail,
      });
    }

    await venue.save();

    // Keep host request document in sync so host management sees live bookings
    if (venue.hostRequestId) {
      try {
        const hostReq = await HostRequest.findById(venue.hostRequestId);
        if (hostReq) {
          // Ensure seats array exists and matches venue capacity
          hostReq.seats = hostReq.seats || [];
          const desiredSeats = venue.seats || [];
          // Resize host seats to match venue seats length
          if (hostReq.seats.length !== desiredSeats.length) {
            hostReq.seats = Array.from({ length: desiredSeats.length }, (_, i) => {
              const existing = hostReq.seats.find((s) => s.id === i + 1);
              return existing || { id: i + 1, label: '', bookings: [] };
            });
          }
          // Copy bookings for the affected seats only to avoid wiping labels
          for (const seatId of seatIds) {
            const venueSeat = desiredSeats.find((s) => s.id === seatId);
            const hostSeatIdx = hostReq.seats.findIndex((s) => s.id === seatId);
            if (venueSeat && hostSeatIdx >= 0) {
              hostReq.seats[hostSeatIdx].bookings = venueSeat.bookings || [];
              // Preserve label if host edited it in management
              if (hostReq.seats[hostSeatIdx].label === undefined && venueSeat.label) {
                hostReq.seats[hostSeatIdx].label = venueSeat.label;
              }
            }
          }
          hostReq.markModified('seats');
          await hostReq.save();
        }
      } catch (syncErr) {
        console.warn('Failed to sync host request seats:', syncErr);
      }
    }

    return res.json({ message: 'Seats booked successfully', venue });
  } catch (err) {
    console.error('Error booking seats:', err);
    return res.status(500).json({ error: 'Failed to book seats' });
  }
});

// Get user's booking history (requires auth)
app.get('/api/bookings/history', getUserFromToken, async (req, res) => {
  try {
    const bookings = [];

    // Fetch venue bookings using nested $elemMatch for arrays-in-arrays
    const venues = await Venue.find({
      seats: { $elemMatch: { bookings: { $elemMatch: { createdByEmail: req.userEmail, createdBy: 'user' } } } }
    });

    for (const venue of venues) {
      for (const seat of venue.seats || []) {
        const userBookings = (seat.bookings || []).filter(
          (b) => b && b.createdByEmail === req.userEmail && (b.createdBy === 'user')
        );
        for (const booking of userBookings) {
          // Derive a sensible bookedAt timestamp from date + startTime when possible
          let bookedAtIso = new Date().toISOString();
          if (booking.date) {
            try {
              const base = `${booking.date}T${(booking.startTime || '00:00').padStart(5, '0')}:00Z`;
              const d = new Date(base);
              if (!isNaN(d.getTime())) bookedAtIso = d.toISOString();
            } catch {}
          }

          bookings.push({
            type: 'venue',
            venueId: venue._id,
            venueName: venue.venueName,
            seatId: seat.id,
            seatLabel: seat.label || '',
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            hours: booking.hours || 1,
            pricePerHour: venue.pricePerHour || 0,
            totalPrice: (venue.pricePerHour || 0) * (booking.hours || 1),
            address: venue.address,
            city: venue.city,
            bookedAt: bookedAtIso,
          });
        }
      }
    }

    // Fetch event bookings
    const events = await Event.find({ 'bookings.userEmail': req.userEmail, status: 'approved' });
    for (const event of events) {
      const userBookings = (event.bookings || []).filter(
        (b) => b && b.userEmail === req.userEmail
      );
      for (const booking of userBookings) {
        bookings.push({
          type: 'event',
          eventId: event._id,
          eventTitle: event.title,
          quantity: booking.quantity || 1,
          pricePerTicket: event.price || 0,
          totalPrice: (event.price || 0) * (booking.quantity || 1),
          date: event.date,
          startTime: event.startTime || '',
          endTime: event.endTime || '',
          location: event.location,
          venue: event.venue || '',
          bookedAt: (booking.bookedAt && !isNaN(new Date(booking.bookedAt).getTime()))
            ? new Date(booking.bookedAt).toISOString()
            : new Date().toISOString(),
        });
      }
    }

    // Sort by booking date (most recent first)
    bookings.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching booking history:', err);
    // Provide clearer error context for client debugging
    res.status(500).json({ error: 'Failed to fetch booking history', details: err?.message || 'Unknown error' });
  }
});

app.get('/api/communities', async (req, res) => {
  try {
    const communities = await Community.find({}).sort({ members: -1 });
    res.json(communities);
  } catch (err) {
    console.error('Error fetching communities:', err);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

// Create new community (requires authentication)
app.post('/api/communities', getUserFromToken, async (req, res) => {
  try {
    const {
      name,
      icon,
      description,
      category,
      isPrivate,
      requireApproval,
      allowMemberInvites,
      members,
      events,
      posts,
      tags,
      image,
      badge,
    } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Name, description, and category are required' });
    }

    const community = await Community.create({
      name,
      icon: icon || '👥',
      description,
      category,
      isPrivate: isPrivate || false,
      requireApproval: requireApproval || false,
      allowMemberInvites: allowMemberInvites !== undefined ? allowMemberInvites : true,
      members: members || 1,
      events: events || 0,
      posts: posts || 0,
      tags: tags || [category],
      image: image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
      badge: badge || '',
      createdBy: req.userEmail,
    });

    // Automatically add creator as an active admin member
    try {
      const creator = await User.findOne({ email: req.userEmail });
      await CommunityMember.create({
        communityId: community._id,
        userEmail: req.userEmail,
        userName: creator?.name || req.userEmail,
        role: 'admin',
        status: 'active',
      });
    } catch (memberErr) {
      console.error('Error creating creator membership:', memberErr);
      // Non-fatal: still return the community; frontend can handle joining if needed
    }

    res.status(201).json(community);
  } catch (err) {
    console.error('Error creating community:', err);
    res.status(500).json({ error: 'Failed to create community' });
  }
});

// Join a community
app.post('/api/communities/:id/join', getUserFromToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const user = await User.findOne({ email: req.userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a member
    const existingMember = await CommunityMember.findOne({
      communityId: req.params.id,
      userEmail: req.userEmail
    });

    if (existingMember) {
      // Return success with existing membership info instead of error
      return res.json({
        message: 'Already a member of this community',
        status: existingMember.status,
        alreadyMember: true
      });
    }

    // Create membership
    const status = community.requireApproval ? 'pending' : 'active';
    const newMember = await CommunityMember.create({
      communityId: req.params.id,
      userEmail: req.userEmail,
      userName: user.name,
      role: 'member',
      status
    });

    // Increment member count if not requiring approval
    if (!community.requireApproval) {
      await Community.findByIdAndUpdate(req.params.id, {
        $inc: { members: 1 }
      });
    }

    res.json({
      message: status === 'pending' 
        ? 'Join request sent for approval' 
        : 'Successfully joined community',
      status,
      alreadyMember: false
    });
  } catch (err) {
    console.error('Error joining community:', err);
    res.status(500).json({ error: 'Failed to join community' });
  }
});

// Get community details with membership status
app.get('/api/communities/:id', getUserFromToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const membership = await CommunityMember.findOne({
      communityId: req.params.id,
      userEmail: req.userEmail
    });

    res.json({
      ...community.toObject(),
      membership: membership ? {
        role: membership.role,
        status: membership.status,
        joinedAt: membership.joinedAt
      } : null
    });
  } catch (err) {
    console.error('Error fetching community:', err);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
});

// Get community messages
app.get('/api/communities/:id/messages', getUserFromToken, async (req, res) => {
  try {
    // Check membership
    const membership = await CommunityMember.findOne({
      communityId: req.params.id,
      userEmail: req.userEmail,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this community' });
    }

    const community = await Community.findById(req.params.id);
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const messages = await Message.find({ 
      communityId: req.params.id,
      'metadata.deletedAt': { $exists: false }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Decrypt messages if community is private
    const decryptedMessages = messages.map(msg => {
      const messageObj = msg.toObject();
      if (messageObj.isEncrypted && community.isPrivate) {
        try {
          const encryptedData = JSON.parse(messageObj.content);
          messageObj.content = decrypt(encryptedData);
        } catch (err) {
          console.error('Error decrypting message:', err);
          messageObj.content = '[Encrypted message]';
        }
      }
      return messageObj;
    });

    res.json(decryptedMessages.reverse());
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
app.post('/api/communities/:id/messages', getUserFromToken, async (req, res) => {
  try {
    const { content, type = 'text' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check membership
    const membership = await CommunityMember.findOne({
      communityId: req.params.id,
      userEmail: req.userEmail,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this community' });
    }

    const community = await Community.findById(req.params.id);
    const user = await User.findOne({ email: req.userEmail });

    let messageContent = content;
    let isEncrypted = false;

    // Encrypt message for private communities
    if (community.isPrivate) {
      const encrypted = encrypt(content);
      messageContent = JSON.stringify(encrypted);
      isEncrypted = true;
    }

    const message = await Message.create({
      communityId: req.params.id,
      senderId: req.userEmail,
      senderName: user.name,
      content: messageContent,
      isEncrypted,
      type
    });

    // Increment post count
    await Community.findByIdAndUpdate(req.params.id, {
      $inc: { posts: 1 }
    });

    // Return decrypted message
    const responseMessage = message.toObject();
    if (isEncrypted) {
      responseMessage.content = content;
    }

    // Broadcast new message to live subscribers
    io.to(String(req.params.id)).emit('message:new', responseMessage);

    res.status(201).json(responseMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get community members (requires membership)
app.get('/api/communities/:id/members', getUserFromToken, async (req, res) => {
  try {
    const membership = await CommunityMember.findOne({
      communityId: req.params.id,
      userEmail: req.userEmail,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this community' });
    }

    const members = await CommunityMember.find({
      communityId: req.params.id,
      status: 'active'
    }).sort({ joinedAt: -1 });

    res.json(members);
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get pending join requests (admin only)
app.get('/api/communities/:id/pending-requests', getUserFromToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.createdBy !== req.userEmail) {
      return res.status(403).json({ error: 'Only admins can view pending requests' });
    }

    const pendingMembers = await CommunityMember.find({
      communityId: req.params.id,
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.json(pendingMembers);
  } catch (err) {
    console.error('Error fetching pending requests:', err);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// Approve or reject a join request (admin only)
app.post('/api/communities/:id/requests/:memberEmail/approve', getUserFromToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.createdBy !== req.userEmail) {
      return res.status(403).json({ error: 'Only admins can approve requests' });
    }

    const memberEmail = decodeURIComponent(req.params.memberEmail);
    const member = await CommunityMember.findOneAndUpdate(
      { communityId: req.params.id, userEmail: memberEmail, status: 'pending' },
      { status: 'active', joinedAt: new Date() },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ error: 'Pending request not found' });
    }

    // Increment member count
    await Community.findByIdAndUpdate(req.params.id, { $inc: { members: 1 } });

    res.json({ message: 'Request approved', member });
  } catch (err) {
    console.error('Error approving request:', err);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

app.post('/api/communities/:id/requests/:memberEmail/reject', getUserFromToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.createdBy !== req.userEmail) {
      return res.status(403).json({ error: 'Only admins can reject requests' });
    }

    const memberEmail = decodeURIComponent(req.params.memberEmail);
    const result = await CommunityMember.deleteOne({
      communityId: req.params.id,
      userEmail: memberEmail,
      status: 'pending'
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Pending request not found' });
    }

    res.json({ message: 'Request rejected' });
  } catch (err) {
    console.error('Error rejecting request:', err);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// Admin: directly add a member to community (admin only)
app.post('/api/communities/:id/add-member', getUserFromToken, async (req, res) => {
  try {
    const { userEmail, userName } = req.body;

    if (!userEmail || !userName) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.createdBy !== req.userEmail) {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    // Check if already a member
    const existingMember = await CommunityMember.findOne({
      communityId: req.params.id,
      userEmail
    });

    if (existingMember) {
      return res.status(409).json({ error: 'User is already a member of this community' });
    }

    // Create active membership
    const newMember = await CommunityMember.create({
      communityId: req.params.id,
      userEmail,
      userName,
      role: 'member',
      status: 'active'
    });

    // Increment member count
    await Community.findByIdAndUpdate(req.params.id, { $inc: { members: 1 } });

    res.status(201).json({ message: 'Member added successfully', member: newMember });
  } catch (err) {
    console.error('Error adding member:', err);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Leave community
app.post('/api/communities/:id/leave', getUserFromToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is the creator/admin
    if (community.createdBy === req.userEmail) {
      return res.status(400).json({ error: 'Admins cannot leave. Delete the community instead.' });
    }

    const result = await CommunityMember.deleteOne({
      communityId: req.params.id,
      userEmail: req.userEmail
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Not a member of this community' });
    }

    // Decrement member count
    await Community.findByIdAndUpdate(req.params.id, {
      $inc: { members: -1 }
    });

    res.json({ message: 'Successfully left the community' });
  } catch (err) {
    console.error('Error leaving community:', err);
    res.status(500).json({ error: 'Failed to leave community' });
  }
});

// Delete community (admin only)
app.delete('/api/communities/:id', getUserFromToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.createdBy !== req.userEmail) {
      return res.status(403).json({ error: 'Only the community admin can delete it' });
    }

    // Delete all members
    await CommunityMember.deleteMany({ communityId: req.params.id });
    
    // Delete all messages
    await Message.deleteMany({ communityId: req.params.id });
    
    // Delete the community
    await Community.findByIdAndDelete(req.params.id);

    res.json({ message: 'Community deleted successfully' });
  } catch (err) {
    console.error('Error deleting community:', err);
    res.status(500).json({ error: 'Failed to delete community' });
  }
});

// Remove member (admin only)
app.delete('/api/communities/:id/members/:memberEmail', getUserFromToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.createdBy !== req.userEmail) {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    if (req.params.memberEmail === req.userEmail) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }

    const result = await CommunityMember.deleteOne({
      communityId: req.params.id,
      userEmail: req.params.memberEmail
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Decrement member count
    await Community.findByIdAndUpdate(req.params.id, {
      $inc: { members: -1 }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Update community details (admin only)
app.put('/api/communities/:id', getUserFromToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.createdBy !== req.userEmail) {
      return res.status(403).json({ error: 'Only admins can update community details' });
    }

    const { name, description, icon, category, isPrivate, requireApproval, allowMemberInvites } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (icon) updates.icon = icon;
    if (category) updates.category = category;
    if (typeof isPrivate === 'boolean') updates.isPrivate = isPrivate;
    if (typeof requireApproval === 'boolean') updates.requireApproval = requireApproval;
    if (typeof allowMemberInvites === 'boolean') updates.allowMemberInvites = allowMemberInvites;

    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updatedCommunity);
  } catch (err) {
    console.error('Error updating community:', err);
    res.status(500).json({ error: 'Failed to update community' });
  }
});

server.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});

// Add an owner booking to a specific seat (requires auth and ownership)
app.post('/host/my-requests/:id/seats/:seatId/bookings', getUserFromToken, async (req, res) => {
  try {
    const { date, startTime, hours } = req.body || {};
    const seatId = parseInt(req.params.seatId, 10);
    if (!date || !startTime || !hours || !seatId) {
      return res.status(400).json({ error: 'date, startTime, hours, and seatId are required' });
    }

    const venue = await HostRequest.findOne({ _id: req.params.id, submittedByEmail: req.userEmail });
    if (!venue) return res.status(404).json({ error: 'Venue not found or unauthorized' });

    // Compute endTime
    const [sh, sm] = String(startTime).split(':').map((x) => parseInt(x, 10));
    const startMin = sh * 60 + (sm || 0);
    const endMin = startMin + (hours * 60);
    const eh = Math.floor(endMin / 60) % 24;
    const em = endMin % 60;
    const endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    // Ensure seats exist with capacity
    const cap = venue.capacity || 0;
    venue.seats = Array.from({ length: cap }, (_, i) => {
      const existing = (venue.seats || []).find((s) => s.id === i + 1);
      return existing || { id: i + 1, label: '', bookings: [] };
    });

    const seat = venue.seats.find((s) => s.id === seatId);
    if (!seat) return res.status(404).json({ error: 'Seat not found' });

    // Prevent overlapping with existing bookings (especially user bookings)
    const overlaps = (seat.bookings || []).some((b) => {
      if (!b || String(b.date) !== String(date)) return false;
      const [bsH, bsM] = String(b.startTime || '00:00').split(':').map((x) => parseInt(x, 10));
      const [beH, beM] = String(b.endTime || '00:00').split(':').map((x) => parseInt(x, 10));
      const bStart = (bsH * 60) + (bsM || 0);
      const bEnd = (beH * 60) + (beM || 0);
      return startMin < bEnd && endMin > bStart;
    });
    if (overlaps) {
      // If any overlap exists, disallow creating conflicting owner booking
      return res.status(409).json({ error: 'Selected time overlaps with an existing booking' });
    }

    // Add owner booking
    seat.bookings = seat.bookings || [];
    seat.bookings.push({ date, startTime, endTime, hours, createdBy: 'owner', createdByEmail: req.userEmail });

    await venue.save();

    // Sync to public Venue preserving user bookings
    try {
      const publicVenue = await Venue.findOne({ hostRequestId: venue._id });
      if (publicVenue) {
        const maxSeats = Math.max(venue.capacity || 0, (publicVenue.seats || []).length, (venue.seats || []).length);
        publicVenue.seats = Array.from({ length: maxSeats }, (_, idx) => {
          const id = idx + 1;
          const hostSeat = (venue.seats || []).find((s) => s.id === id) || { id, label: '', bookings: [] };
          const pvSeat = (publicVenue.seats || []).find((s) => s.id === id) || { id, label: '', bookings: [] };
          const userBookings = (pvSeat.bookings || []).filter((b) => b && b.createdBy === 'user');
          const ownerBookings = (hostSeat.bookings || []).filter((b) => !b.createdBy || b.createdBy === 'owner');
          return { id, label: hostSeat.label ?? pvSeat.label ?? '', bookings: [...userBookings, ...ownerBookings] };
        });
        await publicVenue.save();
      }
    } catch (syncErr) {
      console.warn('Failed to sync owner booking to public Venue:', syncErr?.message || syncErr);
    }

    res.status(201).json({ message: 'Booking added', venue });
  } catch (err) {
    console.error('Error adding owner booking:', err);
    res.status(500).json({ error: 'Failed to add booking' });
  }
});

// Remove an owner booking from a specific seat by index (requires auth and ownership)
app.delete('/host/my-requests/:id/seats/:seatId/bookings/:index', getUserFromToken, async (req, res) => {
  try {
    const seatId = parseInt(req.params.seatId, 10);
    const index = parseInt(req.params.index, 10);
    const venue = await HostRequest.findOne({ _id: req.params.id, submittedByEmail: req.userEmail });
    if (!venue) return res.status(404).json({ error: 'Venue not found or unauthorized' });

    const seat = (venue.seats || []).find((s) => s.id === seatId);
    if (!seat) return res.status(404).json({ error: 'Seat not found' });
    const target = seat.bookings && seat.bookings[index];
    if (!target) return res.status(404).json({ error: 'Booking not found' });
    if (target.createdBy === 'user') {
      return res.status(403).json({ error: "You can't delete bookings made by users" });
    }

    seat.bookings.splice(index, 1);
    await venue.save();

    // Sync to public Venue
    try {
      const publicVenue = await Venue.findOne({ hostRequestId: venue._id });
      if (publicVenue) {
        const maxSeats = Math.max(venue.capacity || 0, (publicVenue.seats || []).length, (venue.seats || []).length);
        publicVenue.seats = Array.from({ length: maxSeats }, (_, idx) => {
          const id = idx + 1;
          const hostSeat = (venue.seats || []).find((s) => s.id === id) || { id, label: '', bookings: [] };
          const pvSeat = (publicVenue.seats || []).find((s) => s.id === id) || { id, label: '', bookings: [] };
          const userBookings = (pvSeat.bookings || []).filter((b) => b && b.createdBy === 'user');
          const ownerBookings = (hostSeat.bookings || []).filter((b) => !b.createdBy || b.createdBy === 'owner');
          return { id, label: hostSeat.label ?? pvSeat.label ?? '', bookings: [...userBookings, ...ownerBookings] };
        });
        await publicVenue.save();
      }
    } catch (syncErr) {
      console.warn('Failed to sync owner booking removal to public Venue:', syncErr?.message || syncErr);
    }

    res.json({ message: 'Booking removed', venue });
  } catch (err) {
    console.error('Error removing owner booking:', err);
    res.status(500).json({ error: 'Failed to remove booking' });
  }
});

// Book tickets for an event (requires auth)
app.post('/api/events/:id/book-tickets', getUserFromToken, async (req, res) => {
  try {
    const { quantity } = req.body || {};
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      return res.status(400).json({ error: 'Positive quantity is required' });
    }
    const event = await Event.findById(req.params.id);
    if (!event || event.status !== 'approved') {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.ticketsAvailable !== undefined && event.ticketsAvailable < qty) {
      return res.status(409).json({ error: 'Not enough tickets available' });
    }
    // Update counts
    event.attendees = (event.attendees || 0) + qty;
    if (typeof event.ticketsAvailable === 'number') {
      event.ticketsAvailable = Math.max(0, event.ticketsAvailable - qty);
    }
    // Record booking metadata
    event.bookings = event.bookings || [];
    event.bookings.push({
      userEmail: req.userEmail,
      userName: req.userName || req.userEmail,
      quantity: qty,
      bookedAt: new Date(),
    });
    await event.save();
    res.json({ message: 'Tickets booked successfully', event });
  } catch (err) {
    console.error('Error booking tickets:', err);
    res.status(500).json({ error: 'Failed to book tickets' });
  }
});
