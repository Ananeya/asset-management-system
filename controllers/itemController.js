const Item = require("../models/Item");
const User = require("../models/User");

// Create all exports as an object
const itemController = {
  // Assign an item to a specific user
  assignItem: async (req, res) => {
    const { itemId, userId } = req.body;

    try {
      // Check if item exists and is available
      let item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ msg: "Item not found" });
      }
      if (!item.availability) {
        return res.status(400).json({ msg: "Item is already assigned" });
      }

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Update item assignment
      item.assignedTo = user._id;
      item.availability = false;
      item.history.push({
        userId: user._id,
        status: "assigned",
      });

      await item.save();
      res.status(200).json({ msg: "Item assigned successfully", item });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },

  // Reassign item to a different user
  reassignItem: async (req, res) => {
    const { itemId, newUserId } = req.body;

    try {
      // Verify item exists and is currently assigned
      let item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ msg: "Item not found" });
      }
      if (!item.assignedTo) {
        return res.status(400).json({ msg: "Item is not assigned to anyone" });
      }

      // Verify new user exists
      const newUser = await User.findById(newUserId);
      if (!newUser) {
        return res.status(404).json({ msg: "New user not found" });
      }

      // Update assignment
      item.assignedTo = newUser._id;
      item.history.push({
        userId: newUser._id,
        status: "reassigned",
      });

      await item.save();
      res.status(200).json({ msg: "Item reassigned successfully", item });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },

  // 1. Search Items Function
  // Search for items based on name or category
  searchItems: async (req, res) => {
    const { query } = req.query;
    
    try {
      if (!query) {
        return res.status(400).json({
          message: "Search query is required"
        });
      }

      const items = await Item.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
        ],
      });

      if (items.length === 0) {
        return res.status(404).json({
          message: "No items found matching your search criteria"
        });
      }

      res.status(200).json(items);
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ 
        message: "An unexpected error occurred while searching items" 
      });
    }
  },

  // Function to filter items based on availability and category
  filterItems: async (req, res) => {
    try {
      const { availability, category } = req.query;
      const filters = {};

      // Add filters based on the query parameters
      if (availability) {
        // Convert string 'true'/'false' to boolean
        filters.availability = availability === 'true';
      }

      if (category) {
        // Add case-insensitive category filter
        filters.category = new RegExp(category, 'i');
      }

      const items = await Item.find(filters);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error filtering items', error: error.message });
    }
  },

  // Create new item (for storekeepers)
  createItem: async (req, res) => {
    try {
      const { name, category, description } = req.body;
      
      const newItem = new Item({
        name,
        category,
        description,
        status: 'available'
      });

      await newItem.save();
      res.status(201).json(newItem);
    } catch (err) {
      res.status(500).json({ message: 'Error creating item', error: err.message });
    }
  },

  // Get all items with optional population of assignedTo
  getAllItems: async (req, res) => {
    try {
      const items = await Item.find()
        .populate('assignedTo', 'username email')
        .populate('history.userId', 'username');
      res.status(200).json(items);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching items', error: err.message });
    }
  },

  // Get items assigned to specific user
  getAssignedItems: async (req, res) => {
    try {
      const userId = req.user.id; // From auth middleware
      const items = await Item.find({ assignedTo: userId })
        .populate('assignedTo', 'username email');
      res.status(200).json(items);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching assigned items', error: err.message });
    }
  },

  // Report issue for an item
  reportIssue: async (req, res) => {
    try {
      const { itemId } = req.params;
      const { issue } = req.body;
      const userId = req.user.id;

      if (!issue) {
        return res.status(400).json({
          message: "Issue description is required"
        });
      }

      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({
          message: "Item not found"
        });
      }

      item.issueReports.push({
        issue,
        reportedBy: userId,
        status: 'pending'
      });

      await item.save();
      res.status(200).json({
        message: "Issue reported successfully",
        item
      });
    } catch (err) {
      if (err.name === 'CastError') {
        return res.status(400).json({
          message: "Invalid item ID format"
        });
      }
      console.error('Error reporting issue:', err);
      res.status(500).json({
        message: "An unexpected error occurred while reporting the issue"
      });
    }
  },

  // Request additional item
  requestAdditionalItem: async (req, res) => {
    try {
      const { itemId, reason } = req.body;
      const userId = req.user.id;

      // Here you might want to create a new schema for item requests
      // For now, we'll just return a success message
      res.status(200).json({ 
        message: 'Request submitted successfully',
        request: { itemId, userId, reason }
      });
    } catch (err) {
      res.status(500).json({ message: 'Error submitting request', error: err.message });
    }
  },

  // Update item status
  updateStatus: async (req, res) => {
    try {
      const { itemId } = req.params;
      const { status } = req.body;
      
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      item.status = status;
      await item.save();
      res.status(200).json(item);
    } catch (err) {
      res.status(500).json({ message: 'Error updating status', error: err.message });
    }
  },
};

module.exports = itemController;
