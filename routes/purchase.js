const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

const Purchase = require('../models/purchase');
const Video = require('../models/Video');

// ✅ Purchase a video
router.post('/:videoId', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const videoId = req.params.videoId;

  try {
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({ userId, videoId });
    if (existingPurchase) {
      return res.status(400).json({ message: 'You already purchased this video' });
    }

    // Create new purchase
    const purchase = new Purchase({ userId, videoId });
    await purchase.save();

    res.status(200).json({ message: 'Video purchased successfully' });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ message: 'Server error during purchase' });
  }
});

// ✅ Get user's purchased videos
router.get('/my', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const purchases = await Purchase.find({ userId }).populate('videoId');

    const purchasedVideos = purchases
      .filter(p => p.videoId) // Ensure the video still exists
      .map(p => ({
        id: p.videoId._id,
        title: p.videoId.title,
        filePath: p.videoId.filePath,
      }));

    res.status(200).json(purchasedVideos);
  } catch (err) {
    console.error('Error fetching purchases:', err);
    res.status(500).json({ message: 'Failed to fetch purchased videos' });
  }
});

module.exports = router;
