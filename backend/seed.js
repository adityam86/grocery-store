import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import { products } from './data/products.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    // Seed products catalog
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      hindiName: p.hindiName || '',
      category: p.category,
      price: p.price,
      unit: p.unit,
      description: p.description || '',
      rating: p.rating || 5.0,
      reviewsCount: p.reviewsCount || 0,
      tag: p.tag || '',
      stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 50,
      inStock: p.inStock !== undefined ? p.inStock : true
    }));

    await Product.insertMany(formattedProducts);
    console.log(`Successfully seeded ${formattedProducts.length} products!`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
