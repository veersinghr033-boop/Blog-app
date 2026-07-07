import { getMessaging } from "firebase-admin/messaging";
import "../config/firebase.ts";
import User from "../models/UsersModel.ts";

export const sendPushNotification = async ({
  token,
  tokens,
  title,
  body,
  data = {},
}: {
  token?: string;
  tokens?: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) => {
  try {
    const payload = {
      notification: {
        title,
        body,
      },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)]),
      ),
    };

    if (token) {
      const response = await getMessaging().send({
        token,
        ...payload,
      });

      return response;
    }

    if (tokens?.length) {
      const response = await getMessaging().sendEachForMulticast({
        tokens,
        ...payload,
      });

      if (response.failureCount && response.failureCount > 0) {
        response.responses.forEach(async (r, idx) => {
          if (!r.success) {
            const err = r.error as any;
            try {
              console.error(`FCM multicast failed for token: ${tokens[idx]} code=${err?.code} message=${err?.message}`);

              if (err?.code === "messaging/registration-token-not-registered") {
                try {
                  const tokenToRemove = tokens[idx];
                  const result = await User.findOneAndUpdate({ fcmToken: tokenToRemove }, { $unset: { fcmToken: "" } }).exec();
                  console.error('Removed stale fcmToken from user:', result?._id?.toString());
                } catch (dbErr) {
                  console.error('Failed to remove stale fcmToken from DB', dbErr);
                }
              }
            } catch (logErr) {
              console.error('FCM multicast failed for token (unable to stringify error)', tokens[idx], err);
            }
          }
        });
      }

      return response;
    }
  } catch (error) {
    console.error("FCM Error:", error);
  }
};
