import { createSlice } from "@reduxjs/toolkit";
import { fetchComments } from "./commentThunk";

interface CommentState {
    comments: any[];
    loading: boolean;
    error?: string | null;
}

const initialState: CommentState = {
    comments: [],
    loading: false,
    error: null,
};

const commentSlice = createSlice({
    name: "comment",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchComments.pending, (state) => {
                state.loading = true;

            })
            .addCase(fetchComments.fulfilled,(state ,action )=>{
                state.loading =false;
                state.comments = action.payload.comments;
                state.error = null;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        }
})

export default commentSlice.reducer;