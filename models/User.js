const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 20,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    required: true,
    enum: ["employee", "storekeeper"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, "is invalid"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive"],
  },
});

// Hash password before saving user document
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Add this method to the UserSchema
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log("Comparing passwords:");
    console.log("Candidate password:", candidatePassword);
    console.log("Stored hashed password:", this.password);
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
