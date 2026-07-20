import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

const client = axios.create({ baseURL: `${SERVER_URL}/api` });

export async function registerUser(username, password) {
  const { data } = await client.post('/auth/register', { username, password });
  return data;
}

export async function loginUser(username, password) {
  const { data } = await client.post('/auth/login', { username, password });
  return data;
}

export async function loginGuest(displayName) {
  const { data } = await client.post('/auth/guest', { displayName });
  return data;
}
