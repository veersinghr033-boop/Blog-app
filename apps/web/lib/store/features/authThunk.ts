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

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ userName, email, bio }: any, { rejectWithValue }) => {
    try {
      const response = await api.put("/users/profile", { userName, email, bio });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update profile",
      );
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }: any, { rejectWithValue }) => {
    try {
      const response = await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to change password",
      );
    }
  },
);
