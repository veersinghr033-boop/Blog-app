import {createAsyncThunk} from "@reduxjs/toolkit";
import api from "@/utills/axios";

export const getSavedBlogs = createAsyncThunk(
    "blog/getSaved",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/blogsave/get");
            // console.log(response.data)
            return response.data;
        }
        catch (error: any) {
            console.error("Error fetching saved blogs:", error);
            return rejectWithValue(error.response?.data || "Failed to fetch saved blogs");
        }
    }
);