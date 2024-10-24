const Item = require("../models/Item");
const User = require("../models/User");

// Assign item to a user
exports.assignItem = async (req, res) => {
  const { itemId, userId } = req.body;

  try {
    // Find the item and check availability
    let item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    if (!item.availability) {
      return res.status(400).json({ msg: "Item is already assigned" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Assign the item to the user
    item.assignedTo = user._id;
    item.availability = false; // Mark as unavailable

    // Add to the history
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
};

// Reassign item to another user
exports.reassignItem = async (req, res) => {
  const { itemId, newUserId } = req.body;

  try {
    // Find the item
    let item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    // Check if the item is already assigned
    if (!item.assignedTo) {
      return res.status(400).json({ msg: "Item is not assigned to anyone" });
    }

    // Find the new user
    const newUser = await User.findById(newUserId);
    if (!newUser) {
      return res.status(404).json({ msg: "New user not found" });
    }

    // Reassign the item to the new user
    item.assignedTo = newUser._id;

    // Add reassignment to the history
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
};

// 1. Search Items Function
// Search for items based on name or category
const searchItems = async (req, res) => {
  const { query } = req.query; // Get the search query from the request
  try {
    const items = await Item.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Case-insensitive match
        { category: { $regex: query, $options: 'i' } },
      ],
    });
    res.status(200).json(items); // Return the found items
  } catch (error) {
    res.status(500).json({ message: 'Error searching items', error: error.message });
  }
};

// Function to filter items based on availability and assigned status
const filterItems = async (req, res) => {
  const { availability, assignedTo } = req.query; // Get filters from the query
  const filters = {};

  // Add filters based on the query parameters
  if (availability) {
    filters.availability = availability; // Assuming availability can be 'true' or 'false'
  }

  if (assignedTo) {
    filters.assignedTo = assignedTo; // Assuming assignedTo is a user ID
  }

  try {
    const items = await Item.find(filters); // Use the filters in the find query
    res.status(200).json(items); // Return the filtered items
  } catch (error) {
    res.status(500).json({ message: 'Error filtering items', error: error.message });
  }
};



module.exports = {
  filterItems,
  searchItems,
};
