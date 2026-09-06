import Product from '../../models/Product.js';

export const getRecommendedProducts = async (userId) => {
  try {
    // Logic to fetch top 4 best-selling or trending products
    // Assumes fields like salesCount or rating exist in the Product model
    const products = await Product.find({})
      .sort({ salesCount: -1, rating: -1 })
      .limit(4);
      
    return products;
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    throw error;
  }
};

export default { getRecommendedProducts };
