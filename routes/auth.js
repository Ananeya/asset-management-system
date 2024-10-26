const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import the User model
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Protected route example - requires valid JWT token
router.get("/items", authMiddleware, (req, res) => {
  try {
    // Logic for handling the request
    res.status(200).send("Items route");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});



// User Registration Route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: "Please provide username, email, and password" 
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user (password hashed by pre-save hook)
    const newUser = new User({
      username,
      email,
      password,
      role,
    });

    await newUser.save();
    console.log("New user saved:", newUser);

    // Generate JWT Token for immediate login
    const token = jwt.sign(
      { 
        id: newUser._id, 
        role: newUser.role,
        email: newUser.email,
        username: newUser.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return success response with token and user data
    res.status(201).json({
      message: "User registered successfully",
      token: `Bearer ${token}`,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      expiresIn: 86400
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("User found:", user);
    console.log("Provided password:", password);
    console.log("Stored hashed password:", user.password);

    // Check if the password matches using the comparePassword method
    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log(`Password does not match for user: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: "24h" // Increased token expiry to 24 hours
      }
    );

    // Return more comprehensive response
    res.status(200).json({
      message: "Logged in successfully",
      token: `Bearer ${token}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      expiresIn: 86400 // 24 hours in seconds
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add this route for testing
router.post("/check-user", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user);
    console.log("Provided password:", password);
    console.log("Stored hashed password:", user.password);
    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch);
    res.json({ userExists: true, passwordCorrect: isMatch });
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Token Refresh Route - generates new token for valid users
router.post("/refresh-token", authMiddleware, async (req, res) => {
  try {
    // Find user by ID from token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return new token
    res.json({
      token: `Bearer ${token}`,
      expiresIn: 86400
    });
  } catch (error) {
    res.status(500).json({ message: "Error refreshing token" });
  }
});

module.exports = router;
