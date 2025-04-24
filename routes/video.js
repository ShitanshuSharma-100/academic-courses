const express = require('express');
const multer = require('multer');
const verifyToken = require('../middleware/authMiddleware');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video'); // ✅ Add video model

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ Upload video (protected)
router.post('/upload', verifyToken, upload.single('video'), async (req, res) => {
  const { title, description, price } = req.body;
  const filePath = `/uploads/${req.file.filename}`;

  try {
    const newVideo = new Video({
      title,
      description,
      filePath,
      price: parseFloat(price) || 0,
    });

    await newVideo.save();

    res.status(200).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Failed to upload video' });
  }
});

// ✅ List all videos
router.get('/list', async (req, res) => {
  try {
    const videos = await Video.find().select('title description  filePath price');
    res.status(200).json(videos);
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});



const User = require('../models/User');

// ✅ Route to "buy" a video
router.post('/buy/:videoId', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { videoId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user.purchasedVideos.includes(videoId)) {
      user.purchasedVideos.push(videoId);
      await user.save();
    }

    res.status(200).json({ message: 'Video purchased successfully' });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ message: 'Failed to purchase video' });
  }
});


// ✅ Route to get purchased videos for the logged-in user
router.get('/purchased', verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId).populate('purchasedVideos');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.purchasedVideos);
  } catch (err) {
    console.error('Error fetching purchased videos:', err);
    res.status(500).json({ message: 'Failed to fetch purchased videos' });
  }
});

// Get all uploaded videos (for admin view)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const videos = await Video.find({});
    const formatted = videos.map(v => ({
      title: v.title,
      filePath: v.filePath
    }));
    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error loading all videos:', err);
    res.status(500).json({ message: 'Server error loading videos' });
  }
});


module.exports = router;
