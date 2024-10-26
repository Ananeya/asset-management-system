class TokenManager {
  // Get JWT token from browser's localStorage
  static getStoredToken() {
    return localStorage.getItem('authToken');
  }

  // Save JWT token to localStorage
  static setToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove token from localStorage (used during logout)
  static removeToken() {
    localStorage.removeItem('authToken');
  }

  // Get user data from localStorage
  static getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Save user data to localStorage
  static setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Remove user data from localStorage
  static removeUser() {
    localStorage.removeItem('user');
  }

  // Check if stored token is still valid (not expired)
  static isTokenValid() {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      // Decode JWT payload and check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // Get Authorization header with Bearer token
  static getAuthHeader() {
    const token = this.getStoredToken();
    return token ? { Authorization: token } : {};
  }

  // Clear all auth data (token and user)
  static clearAuth() {
    this.removeToken();
    this.removeUser();
  }
}

module.exports = TokenManager;
