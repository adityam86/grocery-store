import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailLower = email.toLowerCase();
    const userExists = await User.findOne({ email: emailLower });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default verifyAdmin roles mapping
    const role = emailLower === 'admin@apnabazar.com' ? 'admin' : 'customer';

    const newUser = new User({
      fullName,
      email: emailLower,
      password: hashedPassword,
      role,
      addresses: []
    });

    await newUser.save();

    // Create JWT Session Token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'apnabazar_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        addresses: newUser.addresses
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Sign JWT Session Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'apnabazar_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
});

// Add saved address
router.post('/address', verifyToken, async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ message: 'Address field is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.addresses.includes(address)) {
      user.addresses.push(address);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Address saved successfully!',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving address', error: error.message });
  }
});

// Remove saved address
router.delete('/address', verifyToken, async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ message: 'Address field is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses = user.addresses.filter(addr => addr !== address);
    await user.save();

    res.json({
      success: true,
      message: 'Address removed successfully!',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error removing address', error: error.message });
  }
});

// Update profile and change password
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailLower = email.toLowerCase();
      const exists = await User.findOne({ email: emailLower });
      if (exists) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
      user.email = emailLower;
    }

    if (fullName) {
      user.fullName = fullName;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect current password' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

// Toggle product in wishlist
router.post('/wishlist/toggle', verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();

    res.json({
      success: true,
      message: index === -1 ? 'Item saved to Wishlist' : 'Item removed from Wishlist',
      wishlist: user.wishlist
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling wishlist', error: error.message });
  }
});

// Get user wishlist products
router.get('/wishlist', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const products = await Product.find({
      $or: [
        { id: { $in: user.wishlist } },
        { _id: { $in: user.wishlist } }
      ]
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving wishlist', error: error.message });
  }
});

export default router;
