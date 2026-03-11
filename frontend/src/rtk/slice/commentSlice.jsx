import { createSlice } from "@reduxjs/toolkit";
import { addComment, getCommentsByVehicleId, replyToComment } from "../thunk/commentThunk";

const initialState = {
  loading: false,
  comments: [],
  pagination: {
    currentPage: 1,
    perpage: 10,
    count: 0,
    totalPages: 1
  },
  error: null,
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        // Prepend new comment to list
        if (action.payload) {
          state.comments.unshift(action.payload);
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Comments
      .addCase(getCommentsByVehicleId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCommentsByVehicleId.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload?.data || [];
        state.pagination = action.payload?.pagination || initialState.pagination;
      })
      .addCase(getCommentsByVehicleId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reply Comment
      .addCase(replyToComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(replyToComment.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific comment with the reply
        if (action.payload) {
          const index = state.comments.findIndex(c => c.id === action.payload.id);
          if (index !== -1) {
            state.comments[index] = action.payload;
          }
        }
      })
      .addCase(replyToComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearComments } = commentSlice.actions;
export default commentSlice.reducer;
