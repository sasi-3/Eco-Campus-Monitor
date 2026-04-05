// API Configuration
// Change API_HOST to your server's IP address or domain for remote access
// Examples:
// - Local: http://localhost:5000
// - Remote (same network): http://192.168.x.x:5000
// - Remote (internet): http://yourdomain.com:5000

const API_HOST = typeof window !== 'undefined' && window.location.hostname
  ? `http://${window.location.hostname}:5000`
  : 'http://localhost:5000';

export const API_CONFIG = {
  BASE_URL: API_HOST,
  ENDPOINTS: {
    SENSORS: `${API_HOST}/api/sensors`,
    READINGS: `${API_HOST}/api/readings`,
    USERS: `${API_HOST}/api/users`,
    AUTH_LOGIN: `${API_HOST}/api/auth/login`,
  }
};
