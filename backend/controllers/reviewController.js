import Review from '../models/Review.js';
import Product from '../models/Product.js';

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = await Review.findOne({ productId: req.params.productId, userId: req.userId });
    if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

    const review = await Review.create({
      productId: req.params.productId,
      userId: req.userId,
      userName: 'User ' + req.userId,
      rating: Number(rating),
      comment
    });

    const reviews = await Review.find({ productId: req.params.productId });
    product.reviewsCount = reviews.length;
    product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await product.save();

    res.status(201).json({ message: 'Review added', review, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
