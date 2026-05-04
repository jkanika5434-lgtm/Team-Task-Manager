// Ye SECURITY GUARD hai — har protected route ke pehle check karta hai
// "Kya tumhare paas valid token hai?"

const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Token header mein aata hai: "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Token decode karo — isse user ka ID milta hai
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id); // User database se dhundho
    next(); // Aage badhne do
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Sirf admins ko allow karo
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};