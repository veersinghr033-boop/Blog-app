import { createSlice } from "@reduxjs/toolkit";
import { createBlog, fetchAllBlogs, fetchBlogById ,deleteBlog} from "./blogThunk";

interface BlogState {
  blogs: any[];
  currentBlog: any | null;
  loading: boolean;
  error?: string | null;
}
const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
};

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs.push(action.payload.blog);
        state.error = null;
      })
      .addCase(createBlog.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchAllBlogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload.blogs;
        state.error = null;
      })
      .addCase(fetchAllBlogs.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload.blog;
        state.error = null;
      })
      .addCase(fetchBlogById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        const deletedBlogId = action.meta.arg;
        state.blogs = state.blogs.filter(blog => blog._id !== deletedBlogId);
        if (Array.isArray(state.currentBlog)) {
          state.currentBlog = state.currentBlog.filter(blog => blog._id !== deletedBlogId);
        }
        state.error = null;
      })
      .addCase(deleteBlog.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default blogSlice.reducer;
