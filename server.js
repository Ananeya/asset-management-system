const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const itemRoutes = require("./routes/items"); // Import your item routes

// Use the item routes
app.use("/api/items", itemRoutes);


// Load environment variables from .env
dotenv.config();

// Import the database connection logic
const connectDB = require("./config/db");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Routes
const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes); // Add item routes

// Set up the server to listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
