// routes/upload.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'temp/' }); // Temporary upload folder

router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'videos' // optional: will create a folder
    });

    // Delete the local temp file after upload
    fs.unlinkSync(filePath);

    res.json({ videoUrl: result.secure_url });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
