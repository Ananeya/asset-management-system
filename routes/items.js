const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const roleMiddleware = require("../middleware/roleMiddleware");

const Item = require("../models/Item");
const {
  createItem,
  getAllItems,
  updateItem,
  deleteItem,
  getAssignedItems,
  updateStatus,
  requestAdditionalItem,
  reportIssue,
  searchItems,
  filterItems,
  assignItem,
  reassignItem
} = require("../controllers/itemController");

// Public routes (no authentication required)
router.get("/search", searchItems);   // Search items by name/category
router.get("/filter", filterItems);   // Filter items by availability/category

// Create new item
router.post("/", async (req, res) => {
  const { name, category, availability } = req.body;

  try {
    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({ 
        message: "Name and category are required fields" 
      });
    }

    // Create new item instance
    const newItem = new Item({
      name,
      category,
      availability,
    });

    // Save to database
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    // Check for validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: err.message 
      });
    }
    // Check for duplicate key errors
    if (err.code === 11000) {
      return res.status(409).json({ 
        message: "Item already exists" 
      });
    }
    // For unexpected errors, log them but send a generic message
    console.error('Error creating item:', err);
    res.status(500).json({ 
      message: "An unexpected error occurred while creating the item" 
    });
  }
});

// Get all items
router.get("/", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find().populate('assignedTo', 'username');
    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ message: "Error fetching items" });
  }
});

// Update existing item
router.put("/:itemId", async (req, res) => {
  const { name, category, availability } = req.body;

  try {
    // Validate item ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
      return res.status(400).json({ 
        message: "Invalid item ID format" 
      });
    }

    // Find item by ID
    let item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ 
        message: "Item not found" 
      });
    }

    // Update fields if provided
    if (name) item.name = name;
    if (category) item.category = category;
    if (availability !== undefined) item.availability = availability;

    await item.save();
    res.status(200).json(item);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: err.message 
      });
    }
    console.error('Error updating item:', err);
    res.status(500).json({ 
      message: "An unexpected error occurred while updating the item" 
    });
  }
});

// Report issue with item (requires authentication)
router.post("/:itemId/report", authMiddleware, async (req, res) => {
  try {
    const { issue } = req.body;
    const userId = req.user.id; // Get user ID from auth token

    // Find item
    let item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    // Add issue report
    item.issueReports.push({
      issue,
      reportedBy: userId,
      status: 'pending'
    });

    await item.save();
    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Assign item to user
router.post("/assign", async (req, res) => {
  try {
    await assignItem(req, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Reassign item to different user
router.post("/reassign", async (req, res) => {
  try {
    await reassignItem(req, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Add this route for dashboard stats
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const [totalItems, availableItems, pendingIssues] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ availability: true }),
      Item.countDocuments({ 'issueReports.status': 'pending' })
    ]);

    res.json({
      total: totalItems,
      available: availableItems,
      pendingIssues: pendingIssues
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: "Error fetching statistics" });
  }
});

// Add this route for recent activity
router.get("/recent-activity", authMiddleware, async (req, res) => {
  try {
    const recentItems = await Item.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('assignedTo', 'username');

    const activities = recentItems.map(item => ({
      type: item.status,
      date: item.updatedAt,
      description: `${item.name} - ${item.status}`
    }));

    res.json(activities);
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    res.status(500).json({ message: "Error fetching recent activity" });
  }
});

// Assign item to employee
router.post("/:itemId/assign", authMiddleware, roleMiddleware(['storekeeper']), async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!item.availability) {
      return res.status(400).json({ message: "Item is already assigned" });
    }

    item.assignedTo = userId;
    item.availability = false;
    item.history.push({
      userId: userId,
      status: "assigned",
      assignedAt: new Date()
    });

    await item.save();

    res.json({ message: "Item assigned successfully", item });
  } catch (error) {
    console.error('Error assigning item:', error);
    res.status(500).json({ message: "Error assigning item" });
  }
});

// Add this route to handle item requests
router.post("/request", authMiddleware, roleMiddleware(['employee']), async (req, res) => {
    try {
        const { category, reason } = req.body;
        const userId = req.user.id;

        // Create a new request record (you'll need to create a Request model)
        const request = new Request({
            category,
            reason,
            requestedBy: userId,
            status: 'pending'
        });

        await request.save();
        res.status(201).json({ message: 'Request submitted successfully', request });
    } catch (error) {
        console.error('Error submitting request:', error);
        res.status(500).json({ message: 'Error submitting request' });
    }
});

module.exports = router;
