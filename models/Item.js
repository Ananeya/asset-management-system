const mongoose = require("mongoose");

// Define the Item Schema with all necessary fields
const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,        // Item must have a name
  },
  category: {
    type: String,
    required: true,        // Item must have a category
  },
  description: {
    type: String,          // Optional description
  },
  availability: {
    type: Boolean,
    default: true,         // New items are available by default
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",           // Reference to User who has this item
  },
  history: [               // Array to track item assignment history
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",       // Reference to User in history
      },
      assignedAt: {
        type: Date,
        default: Date.now, // Timestamp when assignment occurred
      },
      status: {
        type: String,
        enum: ["assigned", "reassigned"], // Only these statuses allowed
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,     // When item was created
  },
  updatedAt: {
    type: Date,
    default: Date.now,     // When item was last updated
  },
  status: {
    type: String,
    default: 'available',  // Default item status
  },
  issueReports: [{         // Array to track reported issues
    issue: {
      type: String,
      required: true       // Issue description required
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'         // User who reported the issue
    },
    reportedAt: {
      type: Date,
      default: Date.now   // When issue was reported
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'], // Issue status options
      default: 'pending'  // New issues are pending by default
    }
  }]
});

module.exports = mongoose.model("Item", ItemSchema);
