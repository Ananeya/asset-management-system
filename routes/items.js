const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

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
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update existing item
router.put("/:itemId", async (req, res) => {
  const { name, category, availability } = req.body;

  try {
    // Find item by ID
    let item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    // Update fields if provided
    item.name = name || item.name;
    item.category = category || item.category;
    item.availability = availability !== undefined ? availability : item.availability;

    await item.save();
    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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

module.exports = router;
