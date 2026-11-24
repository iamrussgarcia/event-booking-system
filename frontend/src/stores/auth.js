import axios from "axios";
import { reactive } from "vue";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "spotlight_token";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = reactive({
  user: null,
  loaded: false,
});

export async function register(payload) {
  const { data } = await api.post("/users/register", payload);
  if (data.access) localStorage.setItem(TOKEN_KEY, data.access);
  auth.user = data.user;
  auth.loaded = true;
  return data.user;
}

export async function signIn(payload) {
  const { data } = await api.post("/users/login", payload);
  if (data.access) localStorage.setItem(TOKEN_KEY, data.access);
  auth.user = data.user;
  auth.loaded = true;
  return data.user;
}

export async function signOut() {
  try {
    await api.post("/users/logout");
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    auth.user = null;
    auth.loaded = true;
  }
}

export async function fetchProfile() {
  try {
    const { data } = await api.get("/users/profile");
    auth.user = data.user;
    auth.loaded = true;
    return data.user;
  } catch (err) {
    auth.user = null;
    auth.loaded = true;
    throw err;
  }
}

export async function updateProfile(payload) {
  const { data } = await api.patch("/users/profile", payload);
  auth.user = data.user;
  return data.user;
}

export async function changePassword(payload) {
  await api.patch("/users/password", payload);
}