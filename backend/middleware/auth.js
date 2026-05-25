const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header (matches your React Native axios config)
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token using the same secret your auth.js uses
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add the user ID to the request so Tasks can use it
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};