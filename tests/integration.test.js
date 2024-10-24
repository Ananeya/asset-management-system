const request = require("supertest");
const app = require("../server"); // Ensure this points to your server setup
const mongoose = require("mongoose");

describe("Asset Management System API Integration Tests", () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test Cases for User Registration
  describe("User Registration", () => {
    it("should register a user successfully", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "testuser@example.com",
        password: "Test@1234",
        role: "employee",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.message).toBe("User registered successfully");
    });

    it("should return an error for duplicate registration", async () => {
      await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "testuser@example.com",
        password: "Test@1234",
        role: "employee",
      });

      const response = await request(app).post("/api/auth/register").send({
        username: "testuser2",
        email: "testuser@example.com",
        password: "Test@1234",
        role: "employee",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("User validation failed");
    });
  });

  // Test Cases for User Login
  describe("User Login", () => {
    it("should log in successfully with valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "Test@1234",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("should return error for invalid login", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "WrongPassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid credentials");
    });
  });

  // Test Cases for Item Creation
  describe("Item Creation", () => {
    let token;

    beforeAll(async () => {
      // Register and log in to get the token
      await request(app).post("/api/auth/register").send({
        username: "itemuser",
        email: "itemuser@example.com",
        password: "Item@1234",
        role: "employee",
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "itemuser@example.com",
        password: "Item@1234",
      });

      token = loginResponse.body.token;
    });

    it("should create an item successfully with valid data", async () => {
      const response = await request(app)
        .post("/api/items")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Item",
          category: "Test Category",
          availability: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Test Item");
    });

    it("should return an error for missing required fields", async () => {
      const response = await request(app)
        .post("/api/items")
        .set("Authorization", `Bearer ${token}`)
        .send({}); // Sending empty object

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Item validation failed");
    });
  });

  // Test Cases for Retrieving Items
  describe("Retrieve Items", () => {
    let token;

    beforeAll(async () => {
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "itemuser@example.com",
        password: "Item@1234",
      });

      token = loginResponse.body.token;
    });

    it("should retrieve all items", async () => {
      const response = await request(app)
        .get("/api/items")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it("should retrieve items with valid filters", async () => {
      const response = await request(app)
        .get("/api/items?category=Test Category")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  // Test Cases for Updating Items
  describe("Update Item", () => {
    let token;
    let itemId;

    beforeAll(async () => {
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "itemuser@example.com",
        password: "Item@1234",
      });

      token = loginResponse.body.token;

      // Create a test item to update
      const itemResponse = await request(app)
        .post("/api/items")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Update Test Item",
          category: "Update Category",
          availability: true,
        });

      itemId = itemResponse.body._id;
    });

    it("should update an item successfully", async () => {
      const response = await request(app)
        .put(`/api/items/${itemId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Item Name",
          category: "Updated Category",
          availability: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Updated Item Name");
    });

    it("should return an error for invalid update data", async () => {
      const response = await request(app)
        .put(`/api/items/${itemId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({}); // Sending empty object

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Item validation failed");
    });
  });
});
