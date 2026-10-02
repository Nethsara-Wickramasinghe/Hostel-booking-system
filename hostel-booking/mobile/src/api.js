import axios from 'axios';
import { API_URL } from './config';

let token = null;
export const setToken = (t) => { token = t; };

const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 15000 });
api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turns any failed request into text the user can read
export const errMsg = (e) =>
  e.response?.data?.errors?.map((x) => x.message).join('\n') || e.response?.data?.message || 'Cannot reach the server. Check your connection.';

export default api;
