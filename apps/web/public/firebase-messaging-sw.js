importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyACOifLSBDaX7BxtQQuVh44wErAhxCxOkE",
  authDomain: "blog-b310a.firebaseapp.com",
  projectId: "blog-b310a",
  storageBucket: "blog-b310a.firebasestorage.app",
  messagingSenderId: "595493141018",
  appId: "1:595493141018:web:bcb9faabb3194c0e206fa3",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // console.log("Background Message", payload);

  self.registration.showNotification(
    payload.notification?.title || "Notification",
    {
      body: payload.notification?.body || "",
      data: payload.data,
    },
    console.log(payload),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/user/messages";
  console.log(" Url", url);

  event.waitUntil(clients.openWindow(url));
});
