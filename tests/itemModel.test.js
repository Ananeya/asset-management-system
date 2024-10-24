const mongoose = require("mongoose");
const Item = require("../models/Item"); // Adjust the path if necessary

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Item Model Test", () => {
  it("create & save item successfully", async () => {
    const itemData = {
      name: "Test Item",
      category: "Test Category",
      availability: true,
      assignedTo: null,
    };

    const item = new Item(itemData);
    const savedItem = await item.save();

    expect(savedItem._id).toBeDefined();
    expect(savedItem.name).toBe(itemData.name);
    expect(savedItem.category).toBe(itemData.category);
    expect(savedItem.availability).toBe(itemData.availability);
  });

  it("fails to create item without required fields", async () => {
    const itemData = {
      name: "Test Item",
      // Missing category and availability
    };

    const item = new Item(itemData);
    let err;
    try {
      await item.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(Error);
  });
});
