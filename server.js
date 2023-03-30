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
  socket.on('joinChat', ({currUser, contact}) => {
    user = join(socket.id, currUser, contact)
  })
  socket.on('message', (message) => {
    socket.emit('message', {msg:message.msg, sent:true, time:Date.now()});
    const sendUserSocket = onlineUsers.get(user.contact);
    const toUser =  getcurrentUser(sendUserSocket)
  
    if(sendUserSocket && user.currUser == toUser.contact){
      socket.to(sendUserSocket).emit('message', {msg:message.msg, sent:false, time:Date.now()});
    }
  });

  socket.on('addUser', (userrId) => {
    onlineUsers.set(userrId, socket.id)
  })

  socket.on('editProfile', (body) => {
    socket.emit('updatedProfile', body);
  })

  socket.on('disconnect', () => {});
});




httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});