// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'do9dztwg4',
  api_key: '437656883992633',
  api_secret: 'gaZmZYjfwQ6uITU5qdxEal5qQCI'
});

module.exports = cloudinary;
