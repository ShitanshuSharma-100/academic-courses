const express = require('express');
const multer = require('multer');
const verifyToken = require('../middleware/authMiddleware');
const Video = require('../models/Video');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

const router = express.Router();

// Multer setup for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary config (uses .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Upload video (protected route)
router.post('/upload', verifyToken, upload.single('video'), async (req, res) => {
  const { title, description, price } = req.body;
  const fileBuffer = req.file.buffer;

  try {
    // Upload to Cloudinary as a video
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder: 'videos' },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Cloudinary upload failed' });
        }

        const newVideo = new Video({
          title,
          description,
          filePath: result.secure_url, // Save Cloudinary video URL
          price: parseFloat(price) || 0,
        });

        await newVideo.save();
        res.status(200).json({ message: 'Video uploaded successfully', video: newVideo });
      }
    );

    Readable.from(fileBuffer).pipe(stream);
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
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const videos = await Video.find({});
    const formatted = videos.map(v => ({
      title: v.title,
      filePath: v.filePath,
      description: v.description,
      price: v.price,
      videoUrl: v.secure_url,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error loading all videos:', err);
    res.status(500).json({ message: 'Server error loading videos' });
  }
});

module.exports = router;
