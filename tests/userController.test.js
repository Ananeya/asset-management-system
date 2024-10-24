const request = require("supertest");
const app = require("../server"); // Adjust the path if necessary

describe("User Registration and Login", () => {
  it("should register a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "testuser",
      password: "testpassword",
      email: "testuser@example.com",
      role: "employee",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.token).toBeDefined();
  });

  it("should login an existing user", async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "testpassword",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it("should return 400 for invalid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "wrongpassword",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid credentials");
  });
});
