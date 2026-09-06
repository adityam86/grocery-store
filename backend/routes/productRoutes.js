import express from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all products (with category, search and regex fuzzy matching)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      const cleanSearch = search.trim().toLowerCase();
      const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const escapedSearch = escapeRegex(cleanSearch);
      // Fuzzy sequential character matching regex pattern:
      const fuzzyPattern = cleanSearch.split('').map(escapeRegex).join('.*');
      
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { hindiName: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { name: { $regex: fuzzyPattern, $options: 'i' } }
      ];
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching products', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching product details', error: error.message });
  }
});

// verifyAdmin Route: Add new product
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, hindiName, category, price, unit, description, rating, tag, stockQuantity } = req.body;

    if (!name || !category || !price || !unit) {
      return res.status(400).json({ message: 'Name, category, price, and unit are required' });
    }

    const qty = stockQuantity !== undefined ? Number(stockQuantity) : 50;

    const newProduct = new Product({
      name,
      hindiName: hindiName || '',
      category,
      price: Number(price),
      unit,
      description: description || '',
      rating: Number(rating) || 5.0,
      reviewsCount: 0,
      inStock: qty > 0,
      tag: tag || '',
      stockQuantity: qty
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
});

// verifyAdmin Route: Update product
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, hindiName, category, price, unit, description, tag, inStock, stockQuantity } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (hindiName !== undefined) product.hindiName = hindiName;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (unit !== undefined) product.unit = unit;
    if (description !== undefined) product.description = description;
    if (tag !== undefined) product.tag = tag;
    
    if (stockQuantity !== undefined) {
      product.stockQuantity = Number(stockQuantity);
      product.inStock = product.stockQuantity > 0;
    } else if (inStock !== undefined) {
      product.inStock = Boolean(inStock);
      if (!product.inStock) product.stockQuantity = 0;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully!',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// verifyAdmin Route: Delete product
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Submit review for product
router.post('/:id/reviews', verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (rating === undefined || !comment) {
      return res.status(400).json({ message: 'Rating (1-5) and comment are required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      r => r.userId === req.userId
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = {
      userId: req.userId,
      userName: user.fullName,
      rating: Number(rating),
      comment,
      createdAt: new Date()
    };

    product.reviews.push(review);
    product.reviewsCount = product.reviews.length;
    
    // Calculate new average rating
    const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.rating = Number((totalRating / product.reviews.length).toFixed(1));

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully!',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

export default router;
