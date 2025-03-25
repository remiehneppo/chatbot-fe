import axios from 'axios';
import { User } from '../types/user';
import { config } from '../config/config';

export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Check for admin routes first
    if (config.url?.startsWith('/api/v1/admin')) {
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // For user routes
      const userToken = localStorage.getItem('user_token');
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle preflight responses or errors
    if (error.response && error.response.status === 204) {
      // Empty response from preflight/OPTIONS is actually OK
      return { status: 204, data: null };
    }

    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const fetchAccounts = async (): Promise<User[]> => {
  const response = await api.get('/users');
  if (response.status !== 200) {
    throw new Error('Failed to fetch accounts');
  }
  return response.data;
};

export const deleteAccount = async (id: string): Promise<void> => {
  const response = await api.delete(`/users/${id}`);
  if (response.status !== 200) {
    throw new Error('Failed to delete account');
  }
};

export const updateAccount = async (
  id: string,
  data: Partial<User>
): Promise<User> => {
  const response = await api.put(`/users/${id}`, data);
  if (response.status !== 200) {
    throw new Error('Failed to update account');
  }
  return response.data;
};

export const createAccount = async (data: Omit<User, 'id'>): Promise<User> => {
  const response = await api.post('/users', data);
  if (response.status !== 200) {
    throw new Error('Failed to create account');
  }
  return response.data;
};
