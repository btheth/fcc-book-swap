class Auth {

  /**
   * Authenticate a user. Save a token string in Local Storage
   *
   * @param {string} token
   */
  static authenticateUser(token) {
    localStorage.setItem('bookswap-token', JSON.stringify(token));
  }

  /**
   * Check if a user is authenticated - check if a token is saved in Local Storage
   *
   * @returns {boolean}
   */
  static isUserAuthenticated() {
    return localStorage.getItem('bookswap-token') !== null;
  }

  /**
   * Deauthenticate a user. Remove a token from Local Storage.
   *
   */
  static deauthenticateUser() {
    localStorage.removeItem('bookswap-token');
  }

  /**
   * Get a token value.
   *
   * @returns {string}
   */

  static getToken() {
    return JSON.parse(localStorage.getItem('bookswap-token')).token;
  }

  static getId() {
    return JSON.parse(localStorage.getItem('bookswap-token')).id;
  }

}

export default Auth;