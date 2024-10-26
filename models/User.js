const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the User Schema with validation rules
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,          // No duplicate usernames allowed
    minlength: 4,          // Username must be at least 4 characters
    maxlength: 20,         // Username cannot exceed 20 characters
  },
  password: {
    type: String,
    required: true,
    minlength: 6,          // Password must be at least 6 characters
  },
  role: {
    type: String,
    required: true,
    enum: ["employee", "storekeeper"],  // Only these two roles are allowed
  },
  email: {
    type: String,
    required: true,
    unique: true,          // No duplicate emails allowed
    match: [/\S+@\S+\.\S+/, "is invalid"],  // Basic email format validation
  },
  createdAt: {
    type: Date,
    default: Date.now,     // Automatically set when user is created
  },
  updatedAt: {
    type: Date,
    default: Date.now,     // Should be updated when user info changes
  },
  status: {
    type: String,
    default: "active",     // New users are active by default
    enum: ["active", "inactive"],  // Only these two statuses are allowed
  },
});

// Middleware: Hash password before saving user
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified
  if (!this.isModified("password")) return next();

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password during login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Debug logging for password comparison
    console.log("Comparing passwords:");
    console.log("Candidate password:", candidatePassword);
    console.log("Stored hashed password:", this.password);
    
    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("bcrypt.compare result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

// Export the User model
module.exports = mongoose.model("User", UserSchema);
