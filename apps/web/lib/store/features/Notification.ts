import { createSlice ,PayloadAction } from "@reduxjs/toolkit";
type NotificationPayload = {
  key: string;
  notification: any;
};
interface AuthState {
  notifications: any | null;
    latestNotification: any | null;

}
const initialState: AuthState = {
  notifications: null,
   latestNotification: null,

};

const NotificationSlice = createSlice({
  name: "Notification",
  initialState,
  reducers: {
    addNotification: (state, action:PayloadAction<NotificationPayload>) => {
      console.log("ADD_NOTIFICATION", action.payload);
      const { key, notification } = action.payload;
      state.notifications = state.notifications || {};
      state.notifications[key] = (state.notifications[key] || 0) - 1;
      state.latestNotification = notification;
    },
     clearNotification: (state, action:PayloadAction<string>) =>{const key = action?.payload;
      state.notifications = state.notifications || {};
      if (key && state.notifications[key]) {
        state.notifications[key] = 0;
      }},
     resetLatestNotification: (state) => {}
  },
});

export const {
  addNotification,
  clearNotification,
  resetLatestNotification,
} = NotificationSlice.actions;
export default NotificationSlice.reducer;
