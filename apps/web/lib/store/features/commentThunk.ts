import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utills/axios';


export const fetchComments = createAsyncThunk(
    'comments/fetchComments',
    async (blogId: string, thunkAPI) => {
        try {
            const res = await api.get(`/comments/${blogId}`);
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to fetch comments');
        }
    }
)
export const addComment = createAsyncThunk(
    'comments/addComment',
    async ({ blog , comment, userId }: { blog: string, comment: string, userId: string }, thunkAPI) => {
        try {
            const res  = await api.post(`/comments/${blog}`, {
                comment,
                userId
            })
            return res.data;
            
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to add comment');
        }
    }
)