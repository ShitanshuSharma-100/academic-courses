const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/video');
const purchaseRoutes = require('./routes/purchase');
const path = require('path');
const connectDB = require('./config/db');
connectDB();
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Middleware to parse JSON
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/uploads', express.static('uploads'));


// Sample route
app.get('/', (req, res) => {
  res.send('Welcome to the Netflix Clone API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
