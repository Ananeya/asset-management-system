// Import required packages
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const itemRoutes = require("./routes/items"); // Import your item routes

// Create Express application instance
const app = express();

// Load environment variables from .env file
dotenv.config();

// Import database connection configuration
const connectDB = require("./config/db");

// Initialize database connection
connectDB();

// Middleware Setup
app.use(express.json());     // Enable JSON request body parsing
app.use(cors());            // Enable Cross-Origin Resource Sharing for all routes

// Import route handlers
const authRoutes = require("./routes/auth");

// Register route handlers
app.use("/api/auth", authRoutes);    // Authentication routes (login, register, etc.)
app.use("/api/items", itemRoutes);   // Item management routes

// Debug log to verify JWT secret is configured
console.log("JWT_SECRET is set:", !!process.env.JWT_SECRET);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
