const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middleware/authMiddleware');
const Video = require('../models/Video');

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

// ✅ Upload video (protected route)
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

// ✅ Public route - List all videos
router.get('/list', async (req, res) => {
  try {
    const videos = await Video.find().select('title description filePath price');
    res.status(200).json(videos);
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});

// ✅ Admin view - All uploaded videos
router.get('/all', verifyToken, async (req, res) => {
  try {
    const videos = await Video.find({});
    const formatted = videos.map(v => ({
      title: v.title,
      filePath: `${process.env.BASE_URL || 'http://localhost:5000'}${v.filePath}`,
      description: v.description,
      price: v.price,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error loading all videos:', err);
    res.status(500).json({ message: 'Server error loading videos' });
  }
});

module.exports = router;
