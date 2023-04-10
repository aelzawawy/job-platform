require('dotenv').config() 
require('./src/db/mongoose');
const express = require("express");
const cors = require('cors')


const app = express();
const port = process.env.PORT
app.use(express.json()); // parse to obj (muust come before router)
app.use(cors());

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: {origin : '*'}
});

const users = require("./src/routers/users");
const jobPosts = require("./src/routers/jobPosts"); 
// Use routers
app.use(users);
app.use(jobPosts);

const online = [];


//Get online users
function join(id,currUser, contact){
  const user = {id,currUser, contact};
  online.push(user);
  return user;
}

// Get curret user
function getcurrentUser(id){
  return online.filter(user => user.id === id).pop()
}

global.onlineUsers = new Map();

io.on('connection', (socket) => {
  let user = {}
  //! [2] Whenever a user chooses a contact "joins a chat"
  //!     get the "id" for both user && contact using the "socket.id" as a "unique index"
  //!     => Then Push to the online list 
  //!     While assigning the last value to a const "user".
  socket.on('joinChat', ({currUser, contact}) => {
    user = join(socket.id, currUser, contact)
  })
  socket.on('message', (message) => {
    // socket.emit('message', {msg:message.msg, sent:true, time:Date.now()});
    //! [4] Get the "socket id" of the user I want to send to based on the "Id" from my contacts 
    const sendUserSocket = onlineUsers.get(user.contact);

    //! [5] Fetching the contact I wanna send to
    const toUser =  getcurrentUser(sendUserSocket)
  
    //! [6] Checking if that contact is (online && opened my chat)
    //!     < online &&  his current contact is me >
    if(sendUserSocket && (user.currUser == toUser?.contact)){
      socket.to(sendUserSocket).emit('message', {msg:message.msg, sent:false, time:Date.now()});
    }
  });
  //! [1] Map all connected users to a "socket id"
  socket.on('addUser', (userrId) => {
    onlineUsers.set(userrId, socket.id)
  })

  socket.on('editProfile', (body) => {
    socket.emit('updatedProfile', body);
  })

  socket.on('role', (role) => {
    socket.emit('role', role);
  })

  socket.on('removeSave', (id) => {
    socket.emit('removeSave', id);
  })

  socket.on('disconnect', () => {});
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});