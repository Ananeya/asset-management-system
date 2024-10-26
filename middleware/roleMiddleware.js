// Middleware to check user roles and permissions
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user's role is in allowed roles array
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions' });
    }

    // User has required role, proceed to next middleware
    next();
  };
};

module.exports = roleMiddleware;
