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
  async (
    {
      userName,
      email,
      bio,
      image,
      removeImage,
    }: {
      userName: string;
      email: string;
      bio: string;
      image?: File | null;
      removeImage?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();

      formData.append("userName", userName);
      formData.append("email", email);
      formData.append("bio", bio);

      if (image) {
        formData.append("image", image);
      }
      if (removeImage) {
        formData.append("removeImage", "true");
      }

      const response = await api.put(
        "/users/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        "Failed to update profile"
      );
    }
  }
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
