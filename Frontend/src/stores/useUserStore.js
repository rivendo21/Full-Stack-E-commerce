import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  cart: [],
  checkingAuth: true,
  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (!name || !email || !password || !confirmPassword) {
      set({ loading: false });
      return toast.error("All fields are required");
    }

    if (password.length < 6) {
      set({ loading: false });
      return toast.error("Password must be at least 6 characters long");
    }

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }
    try {
      const res = await axios.post("/auth/signup", {
        name,
        email,
        password,
      });
      set({ user: res.data, loading: false });
      toast.success("Account created successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message);
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/login", { email, password });
      set({
        user: {
          ...res.data,
          cart: res.data.cart || [],
        },
        loading: false,
      });
      toast.success("Login successful");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Login failed");
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const res = await axios.get("/auth/profile", { withCredentials: true });
      set({
        user: {
          ...res.data,
          cart: res.data.cart || [],
        },
        checkingAuth: false,
      });
    } catch (error) {
      set({ checkingAuth: false, user: null });
      if (error.response && error.response.status !== 401) {
        toast.error(error.response?.data?.message);
      }
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout", { withCredentials: true });
      set({ user: null });
      toast.success("Logout successful");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  refreshToken: async () => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axios.post("/auth/refresh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
}));

let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
