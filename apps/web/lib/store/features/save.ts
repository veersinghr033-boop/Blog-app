import { createSlice } from "@reduxjs/toolkit";
import {  getSavedBlogs } from "./saveThunk";

interface SaveState {
    savedBlogs: any[];
    loading: boolean;
    error?: string | null;
}

const initialState: SaveState = {
    savedBlogs: [],
    loading: false,
    error: null,
};

const saveSlice = createSlice({
    name: "save",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
          .addCase(getSavedBlogs.pending, (state) => {
            state.loading = true;
          })
          .addCase(getSavedBlogs.fulfilled, (state, action) => {
            state.loading = false;
            state.savedBlogs = action.payload.blogs;
            state.error = null;
          })
          .addCase(getSavedBlogs.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
          });
    },
});

const saveReducer = saveSlice.reducer;

export default saveReducer;