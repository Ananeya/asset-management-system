const express = require("express");
const router = express.Router();
// const authMiddleware = require("../middleware/authMiddleware");

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
} = require("../controllers/itemController");

// Removed authMiddleware from these routes
router.get("/search", searchItems);
router.get("/filter", filterItems);

// @route   POST /api/items
// @desc    Create a new item
// @access  Private (Admin)
// router.post("/", authMiddleware, async (req, res) => { secure approach  
// includes the token when you login in your requests
// 1. Create a New Item (POST)
router.post("/", async (req, res) => {
  const { name, category, availability } = req.body;

  try {
    const newItem = new Item({
      name,
      category,
      availability,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. Retrieve All Items (GET)
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. Update an Item (PUT)
router.put("/:itemId", async (req, res) => {
  const { name, category, availability } = req.body;

  try {
    let item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

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

// 4. Delete an Item (DELETE)
router.delete("/:itemId", async (req, res) => {
  try {
    const result = await Item.findByIdAndDelete(req.params.itemId);

    if (!result) {
      return res.status(404).json({ msg: "Item not found" });
    }

    res.status(200).json({ msg: "Item removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 5. View Assigned Items (GET)
router.get("/assigned", async (req, res) => {
  try {
    // Note: This route might need modification as it relies on req.user.id
    // which is set by authMiddleware. For testing, you might want to pass a userId in the query
    const userId = req.query.userId; // Add this line for testing
    const assignedItems = await Item.find({ assignedTo: userId });
    res.status(200).json(assignedItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 6. Update Status of Assigned Item (PUT)
router.put("/:itemId/status", async (req, res) => {
  const { status } = req.body;
  
  try {
    let item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    // Remove the authorization check for testing purposes
    // if (!item.assignedTo || item.assignedTo.toString() !== userId) {
    //   return res.status(403).json({ msg: "Not authorized" });
    // }

    item.status = status;
    await item.save();
    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 7. Request Additional Items (POST)
router.post("/request", async (req, res) => {
  const { itemId } = req.body;

  try {
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    res.status(200).json({ msg: "Request submitted for additional item", itemId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 8. Report Issues with Assigned Items (POST)
router.post("/:itemId/report", async (req, res) => {
  const { issue } = req.body;
  // Add this line for testing
  const userId = req.body.userId;

  try {
    let item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    if (!item.assignedTo || item.assignedTo.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    item.issueReports.push({ issue });
    await item.save();
    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
