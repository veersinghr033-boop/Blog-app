import { createSlice } from "@reduxjs/toolkit";
import { login, signup, logout, updateProfile, changePassword } from "./authThunk";

interface AuthState {
  token: string | null;
  user: any | null;
  activeRole: string | null;
  loading: boolean;
  error?: string | null;
}
const initialState: AuthState = {
  token: null,
  user: null,
  activeRole: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setActiveRole: (state, action) => {
      state.activeRole = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;

        state.activeRole =
          action.payload.user.roles?.includes("admin")
            ? "admin"
            : "user";

        state.error = null;
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.activeRole =
          action.payload.user.roles?.includes("admin")
            ? "admin"
            : "user";

        state.error = null;
      })
      .addCase(signup.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});
export const { setActiveRole } = authSlice.actions;
export default authSlice.reducer;
