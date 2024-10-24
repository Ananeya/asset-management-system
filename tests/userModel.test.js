const mongoose = require("mongoose");
const User = require("../models/User"); // Adjust the path if necessary

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Model Test", () => {
  it("create & save user successfully", async () => {
    const userData = {
      username: "testuser",
      password: "testpassword",
      email: "testuser@example.com",
      role: "employee",
      status: "active",
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.role).toBe(userData.role);
  });

  it("fails to create user without required fields", async () => {
    const userData = {
      username: "testuser",
      // Missing password and email
    };

    const user = new User(userData);
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(Error);
  });
});
