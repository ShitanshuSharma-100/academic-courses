const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure user ID is present
    if (!decoded.id) {
      return res.status(400).json({ message: 'Invalid token payload: missing user ID.' });
    }

    req.user = { id: decoded.id }; // ✅ Make sure req.user.id is available

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};
