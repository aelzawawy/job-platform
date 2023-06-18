const admin = require("firebase-admin");

const serviceAccount = require("./inreach-af837-firebase-adminsdk-5z5n8-54e73bcdac.json");

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
