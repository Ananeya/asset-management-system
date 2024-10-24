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
  searchItems, // Import searchItems function
  filterItems, // Import filterItems function
} = require("../controllers/itemController");

// const itemRoutes = require("./routes/items"); // Import your item routes
const authRoutes = require("./routes/auth"); // Import your auth routes

router.get("/search", authMiddleware, searchItems);
router.get("/filter", authMiddleware, filterItems);

// 1. Create a New Item (POST)
// @route   POST /api/items
// @desc    Create a new item
// @access  Private (Admin)
router.post("/", authMiddleware, async (req, res) => {
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
// @route   GET /api/items
// @desc    Get all items
// @access  Private (Admin or Employee)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. Update an Item (PUT)
// @route   PUT /api/items/:itemId
// @desc    Update an item
// @access  Private (Admin)
router.put("/:itemId", authMiddleware, async (req, res) => {
  const { name, category, availability } = req.body;

  try {
    let item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    // Update the item details
    item.name = name || item.name;
    item.category = category || item.category;
    item.availability =
      availability !== undefined ? availability : item.availability;

    await item.save();
    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. Delete an Item (DELETE)
// @route   DELETE /api/items/:itemId
// @desc    Delete an item
// @access  Private (Admin)
router.delete("/:itemId", authMiddleware, async (req, res) => {
  try {
    let item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    await item.remove();
    res.status(200).json({ msg: "Item removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 5. View Assigned Items (GET)
// @route   GET /api/items/assigned
// @desc    Get items assigned to the logged-in user
// @access  Private (Employee)
router.get("/assigned", authMiddleware, async (req, res) => {
  try {
    const assignedItems = await Item.find({ assignedTo: req.user.id });
    res.status(200).json(assignedItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 6. Update Status of Assigned Item (PUT)
// @route   PUT /api/items/:itemId/status
// @desc    Update the status of an assigned item
// @access  Private (Employee)
router.put("/:itemId/status", authMiddleware, async (req, res) => {
  const { status } = req.body;

  try {
    let item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    if (item.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    item.status = status;
    await item.save();
    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 7. Request Additional Items (POST)
// @route   POST /api/items/request
// @desc    Request additional items
// @access  Private (Employee)
router.post("/request", authMiddleware, async (req, res) => {
  const { itemId } = req.body;

  try {
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    // Logic to handle the request can be added here, such as notifying an admin
    res
      .status(200)
      .json({ msg: "Request submitted for additional item", itemId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 8. Report Issues with Assigned Items (POST)
// @route   POST /api/items/:itemId/report
// @desc    Report an issue with an assigned item
// @access  Private (Employee)
router.post("/:itemId/report", authMiddleware, async (req, res) => {
  const { issue } = req.body;

  try {
    let item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    if (item.assignedTo.toString() !== req.user.id) {
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
