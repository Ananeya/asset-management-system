const TokenManager = require('./tokenManager');

const API_BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

class ApiService {
  // Generic method to make HTTP requests to the API
  static async request(endpoint, options = {}) {
    // Prepare headers with content type and auth token
    const headers = {
      'Content-Type': 'application/json',
      ...TokenManager.getAuthHeader(),
      ...options.headers
    };

    // Make the HTTP request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Handle response
    if (!response.ok) {
      if (response.status === 401) {
        // If unauthorized, clear auth and redirect to login
        TokenManager.clearAuth();
        window.location.href = '/login';
      }
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Login user and store authentication data
  static async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    // Store auth data on successful login
    TokenManager.setToken(response.token);
    TokenManager.setUser(response.user);
    return response;
  }

  // Logout user and clear auth data
  static async logout() {
    TokenManager.clearAuth();
    window.location.href = '/index.html';
  }

  // Get all items (protected route)
  static async getItems() {
    return this.request('/items');
  }

  // Create new item (protected route)
  static async createItem(itemData) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  // Register new user
  static async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    // Store auth data on successful registration
    TokenManager.setToken(response.token);
    TokenManager.setUser(response.user);
    return response;
  }

  // Assign item to employee
  static async assignItem(itemId, userId) {
    return this.request(`/items/${itemId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  // Get all employees
  static async getEmployees() {
    return this.request('/auth/employees');
  }
}

module.exports = ApiService;
