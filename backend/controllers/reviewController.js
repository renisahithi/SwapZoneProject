import Review from "../models/Review.js";
import TradeRequest from "../models/TradeRequest.js";
import User from "../models/User.js";
export const createReview = async (req, res) => {
  try {
    const { tradeRequestId, rating, comment } = req.body;

    const tradeRequest = await TradeRequest.findById(tradeRequestId).populate("listing");
    if (!tradeRequest) return res.status(404).json({ message: "Trade request not found" });

    if (tradeRequest.status !== "Completed") {
      return res.status(400).json({ message: "You can only review a completed trade" });
    }

    const listingOwnerId = tradeRequest.listing.owner.toString();
    const requesterId = tradeRequest.requester.toString();
    const currentUserId = req.user._id.toString();
    if (currentUserId !== listingOwnerId && currentUserId !== requesterId) {
      return res.status(403).json({ message: "Not authorized to review this trade" });
    }
    const revieweeId = currentUserId === listingOwnerId ? requesterId : listingOwnerId;

    const review = await Review.create({
      reviewer: currentUserId,
      reviewee: revieweeId,
      tradeRequest: tradeRequestId,
      rating,
      comment,
    });

    const allReviews = await Review.find({ reviewee: revieweeId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(revieweeId, { trustScore: avgRating.toFixed(1) });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You already reviewed this trade" });
    }
    res.status(400).json({ message: error.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name campus")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};