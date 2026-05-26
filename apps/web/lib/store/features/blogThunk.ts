import {createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utills/axios";

export const createBlog = createAsyncThunk(
    "blog/create",
    async ({ title, content, authorId }: any, { rejectWithValue }) => {
        try {
            const response = await api.post("/blogs/create", {
                title,
                content,
                authorId,
            });
            return response.data;

        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || "Error in creating blog",
            );
        }
    }
);

export const fetchAllBlogs = createAsyncThunk(
    "blog/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/blogs/all");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || "Error in fetching blogs",
            );
        }
    }
);

export const fetchBlogById = createAsyncThunk(
    "blog/fetchById",
    async (blogId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/blogs/${blogId}`);
            console.log( "Blog data:", response.data);
            return response.data;

        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || "Error in fetching blog",
            );
        }
    }
)

export const deleteBlog = createAsyncThunk(
    "blog/delete",
    async (blogId: string, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/blogs/delete/${blogId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || "Error in deleting blog",
            );
        }
    }
)