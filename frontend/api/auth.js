import { request } from './client';

function login(payload) {
  // Added /api/ to the path to match server.js
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function signup(payload) {
  // Added /api/ to the path to match server.js
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export const authApi = {
  login,
  signup,
};