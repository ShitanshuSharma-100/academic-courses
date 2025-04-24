const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user ID exists in token
    if (!decoded.id) {
      return res.status(400).json({ message: 'Invalid token payload: missing user ID.' });
    }

    // Attach user info to request object
    req.user = {
      id: decoded.id,
      role: decoded.role || 'student', // helpful if you're using roles
    };

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
