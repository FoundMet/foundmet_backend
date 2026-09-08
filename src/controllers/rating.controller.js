import RatingModel from "../models/rating.model.js";
import UserModel from "../models/user.model.js";

/**
 * Submit or update rating for a founder
 * POST /api/v1/ratings/:userId
 */
export async function rateFounder(req, res) {
  try {
    const fromUserId = req.user._id;
    const targetUserId = req.params.userId;
    const { stars, feedback, tags } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating stars must be between 1 and 5",
      });
    }

    if (fromUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot rate your own founder profile",
      });
    }

    // Verify target user exists
    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target founder not found",
      });
    }

    // Update existing or create new rating
    const rating = await RatingModel.findOneAndUpdate(
      { fromUser: fromUserId, targetUser: targetUserId },
      {
        stars,
        feedback: feedback ? feedback.trim() : "",
        tags: Array.isArray(tags) ? tags : [],
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Rating submitted for ${targetUser.name}!`,
      rating,
    });
  } catch (error) {
    console.error("Rate Founder Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/**
 * Get ratings and endorsements for a founder
 * GET /api/v1/ratings/:userId
 */
export async function getFounderRatings(req, res) {
  try {
    const targetUserId = req.params.userId;

    const ratings = await RatingModel.find({ targetUser: targetUserId })
      .populate("fromUser", "name role photo")
      .sort({ createdAt: -1 });

    const totalRatings = ratings.length;
    const averageStars =
      totalRatings > 0
        ? (ratings.reduce((sum, r) => sum + r.stars, 0) / totalRatings).toFixed(1)
        : "5.0";

    // Count endorsements
    const endorsementCounts = {};
    ratings.forEach((r) => {
      (r.tags || []).forEach((tag) => {
        endorsementCounts[tag] = (endorsementCounts[tag] || 0) + 1;
      });
    });

    return res.status(200).json({
      success: true,
      averageStars: Number(averageStars),
      totalRatings,
      endorsementCounts,
      reviews: ratings.slice(0, 10),
    });
  } catch (error) {
    console.error("Get Ratings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
