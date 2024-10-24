const request = require("supertest");
const app = require("../server"); // Adjust the path if necessary

describe("Item CRUD Operations", () => {
  let token;

  beforeAll(async () => {
    // Assuming user is already registered and we get the token
    const res = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "testpassword",
    });
    token = res.body.token;
  });

  it("should create a new item", async () => {
    const response = await request(app)
      .post("/api/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "New Item",
        category: "New Category",
        availability: true,
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("New Item");
  });

  it("should retrieve all items", async () => {
    const response = await request(app)
      .get("/api/items")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
