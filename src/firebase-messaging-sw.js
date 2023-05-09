importScripts(
  "https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js"
);
firebase.initializeApp({
  apiKey: "AIzaSyBoF4gTwGd02fmCr4NmZlFeTyeB-GkdSQc",
  authDomain: "inreach-af837.firebaseapp.com",
  projectId: "inreach-af837",
  storageBucket: "inreach-af837.appspot.com",
  messagingSenderId: "229176763315",
  appId: "1:229176763315:web:fc6078e0053c4054fe21c6",
  measurementId: "G-QSNMCTG1C1",
});
const messaging = firebase.messaging();
// if (localStorage['token']){}
messaging.onBackgroundMessage(function (payload) {
  // console.log(payload);
  //todo Customize notification
  const notificationTitle = payload.data.title;
  const notificationOptions = payload.data.title.includes("message")
    ? {
        body: payload.data.body,
        icon: "./assets/reach-logo.png",
        data: {
          pathname: payload.data.pathname,
        },
        // silent: true,
        tag: "new messsage",
      }
    : {
        body: payload.data.body,
        icon: "./assets/icons/icon-512x512.png",
        data: {
          pathname: payload.data.pathname,
        },
      };
  self.addEventListener("push", async function (event) {
    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  });
});
//todo Listen to click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (!event.notification.data.pathname) return;
  const pathname = event.notification.data.pathname;
  const url = new URL(pathname, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        const hadWindowToFocus = clientsArr.some((windowClient) =>
          windowClient.url === url ? (windowClient.focus(), true) : false
        );

        if (!hadWindowToFocus)
          self.clients
            .openWindow(url)
            .then((windowClient) =>
              windowClient ? windowClient.focus() : null
            );
      })
  );
});
