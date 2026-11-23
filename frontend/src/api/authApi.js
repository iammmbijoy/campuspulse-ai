import axiosClient from './axiosClient';

// Login user and fetch JWT tokens
export const loginUser = async (username, password) => {
  const response = await axiosClient.post('/accounts/login/', {
    username,
    password,
  });
  return response.data; // returns { access, refresh }
};

// Register a new user account
export const registerUser = async (userData) => {
  const response = await axiosClient.post('/accounts/register/', userData);
  return response.data;
};

// Get current logged-in user's profile & role
export const fetchCurrentUser = async () => {
  const response = await axiosClient.get('/accounts/me/');
  return response.data;
};