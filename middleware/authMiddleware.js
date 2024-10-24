const jwt = require("jsonwebtoken");

// Middleware function to verify JWT
const authMiddleware = (req, res, next) => {
  // Get token from headers
  const token = req.header("Authorization");

  // Check if token exists
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify token with the JWT secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user object from the token to the request
    req.user = decoded;

    // Move to the next middleware or route handler
    next();
  } catch (err) {
    // If token is not valid, respond with an error
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
