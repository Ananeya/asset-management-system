const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT tokens and protect routes
 * This middleware:
 * 1. Extracts the JWT from the Authorization header
 * 2. Verifies the token is valid
 * 3. Adds the decoded user information to the request object
 */
const authMiddleware = (req, res, next) => {
  // Get token from request headers
  const authHeader = req.header("Authorization");

  // Verify Authorization header exists and has correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Remove 'Bearer ' prefix to get just the token
  const token = authHeader.split(' ')[1];

  try {
    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add decoded user data to request object for use in route handlers
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
