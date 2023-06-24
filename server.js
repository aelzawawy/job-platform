require("dotenv").config();
require("./src/db/mongoose");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();
const port = process.env.PORT;

app.use(helmet()); // To secure HTTP headers
app.use(express.json()); // parse to obj (muust come before router)
app.use(cors({ origin: "*" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
// app.use(xss());
// Prevent parameter pollution
app.use(hpp());

const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: { origin: "*" },
});

const users = require("./src/routers/users");
const jobPosts = require("./src/routers/jobPosts");
// Use routers
app.use(users);
app.use(jobPosts);

const online = [];

//Get online users
function join(socketId, currUser, contact) {
  const user = { socketId, currUser, contact };
  online.push(user);
  return user;
}

// Get curret user
function getcurrentUser(id) {
  return online.filter((user) => user.socketId === id).pop();
}

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  let user = {};
  //! [1] Map all connected users to a "socket id"
  socket.on("addUser", (userrId) => {
    onlineUsers.set(userrId, socket.id);
  });
  //! [2] Whenever a user chooses a contact "joins a chat"
  //!     get the "id" for both user && contact using the "socket.id" as a "unique index"
  //! [3] Then Push to the online list
  //!     While assigning the last value to the variable "user".
  socket.on("joinChat", ({ currUser, contact }) => {
    user = join(socket.id, currUser, contact);
  });
  socket.on("message", (message) => {
    //! [4] Get the "socket id" of the user I want to send to based on the "Id" from my contacts
    const sendUserSocket = onlineUsers.get(user.contact);

    //! [5] Fetching the contact I wanna send to
    const toUser = getcurrentUser(sendUserSocket);

    //! [6] Checking if that contact is (online && opened my chat)
    //!     < online &&  his current contact is me >
    if (sendUserSocket && user.currUser == toUser?.contact) {
      socket.to(sendUserSocket).emit("message", {
        to: user.contact,
        from: user.currUser,
        msg: message.msg,
        sent: false,
        time: Date.now(),
        file: message.file,
        fileName: message.fileName,
        fileSize: message.fileSize,
      });
    }
  });

  //! When I want to delete chat for both users
  socket.on("deleteChat", (body) => {
    const contactSocket = onlineUsers.get(body.contact);
    if (contactSocket) {
      socket.to(contactSocket).emit("deleteChat", {
        contact: body.id,
        rmContact: body.rmContact,
      });
    }
  });

  socket.on("isOnline", (contact_ids) => {
    const onlineContacts = contact_ids.map(
      (id) => Boolean(onlineUsers.get(id)) && id
    );
    socket.emit("isOnline", {
      onlineContacts,
      time: Date.now(),
    });
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
