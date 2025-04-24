const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
    required: false,
  },
  filePath: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  price: { 
    type: Number, 
    required: true,
    default: 0
   }
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
