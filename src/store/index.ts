import { configureStore } from '@reduxjs/toolkit';
import placeholderReducer from './slices/placeholderSlice';
import loggingMiddleware from './middleware/loggingMiddleware';

export const store = configureStore({
  reducer: {
    placeholder: placeholderReducer,
    // Add other reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggingMiddleware),
  // Add other middleware here
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;