const express = require('express');
const multer = require('multer');
const verifyToken = require('../middleware/authMiddleware');
const Video = require('../models/Video');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Multer setup for in-memory storage
const upload = multer({ dest: 'uploads/' });

// Cloudinary config (uses .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Video upload route (for admins only)
router.post('/upload', verifyToken, upload.single('video'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can upload videos' });
    }

    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      folder: 'videos'
    });

    const newVideo = new Video({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      thumbnailUrl: req.body.thumbnailUrl,
      videoUrl: uploaded.secure_url  // Cloudinary URL
    });

    await newVideo.save();
    res.status(200).json({ message: 'Video uploaded successfully' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error during upload' });
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
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const videos = await Video.find(); // Fetch all video documents
    res.status(200).json(videos);
  } catch (err) {
    console.error('Error loading all videos:', err);
    res.status(500).json({ message: 'Server error loading videos' });
  }
});


module.exports = router;
