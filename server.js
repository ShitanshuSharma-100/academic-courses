const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/video');
const purchaseRoutes = require('./routes/purchase');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables from .env file.
dotenv.config();

// Connect to MongoDB using the connection string from the environment variables
connectDB();

const app = express();

// Use the environment variable PORT, if not available fallback to 5000 (not needed for Render)
const PORT = process.env.PORT || 5000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/purchase', purchaseRoutes);

// Serve uploaded video files
app.use('/uploads', express.static('uploads'));

// Sample route to confirm server is working
app.get('/', (req, res) => {
  res.send('Welcome to the Netflix Clone API');
});

// Start server and listen on the assigned port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
