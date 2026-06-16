import { configureStore, combineReducers } from "@reduxjs/toolkit";
import auths from "./features/auth";
import blog from "./features/blog";
import Notification from "./features/Notification"
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  auth: auths,
  blog: blog,
  notification:Notification
});
 

const persistConfig = {
  key: "Blog-app",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware:any) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
