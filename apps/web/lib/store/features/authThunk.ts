import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utills/axios";
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Error in Login",
      );
    }
  },
);

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ username, email, password, role }: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", {
        userName: username,
        email,
        password,
        role,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Error in Signup",
      );
    }
  },
);
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout failed", error);
  }
});
