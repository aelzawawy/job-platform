const admin = require("firebase-admin");

const serviceAccount = {
type: "service_account",
project_id: process.env.FIREBASE_PROJECT_ID,
private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
client_email: process.env.FIREBASE_CLIENT_EMAIL
};

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
});

const pushNotification = (notification) => {
  const message = {
    data: {
      title: notification.title,
      time: notification.time,
      body: notification.body,
      pathname: notification.pathname,
      sender: notification.sender || "",
    },
    token: notification.token,
  };
  admin
    .messaging()
    .send(message)
    .then((response) => {})
    .catch((error) => {
      console.log("Error sending message:", error);
    });
};
module.exports = pushNotification;
