const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  availability: {
    type: Boolean,
    default: true, // Item is available by default
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  history: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      assignedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["assigned", "reassigned"],
      },
    },
  ],
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
    default: 'available', // or any default status you prefer
  },
});

module.exports = mongoose.model("Item", ItemSchema);
