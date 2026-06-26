import { getMessaging } from "firebase-admin/messaging";
import "../config/firebase.ts";

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

      return response;
    }
  } catch (error) {
    console.error("FCM Error:", error);
  }
};
