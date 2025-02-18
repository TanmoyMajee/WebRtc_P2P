const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app); // Create HTTP server

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (Adjust for security)
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON request bodies

// Socket.io connection handling
 const emailToSocketId = new Map();
    const socketIdToEmail = new Map();
    //  we cant initialize the map inside the socket.on as it will create the new map for each user who connected to the server
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);


    // map of emailId to socketId

    socket.on("join-room", (data) => {
  const { emailId, roomId } = data;
  socket.join(roomId);
  console.log("User joined room:", roomId, emailId);
       // here we will emit the same socket id to the user who joined the room
      // so that he can redirect to the room page
  socket.emit("joined-room-conformation", roomId);
        //   we will store the emailId and socketId in the map
    emailToSocketId.set(emailId, socket.id);
    socketIdToEmail.set(socket.id,emailId);
    // now brodcase it to the room that user alrady joined in the room can know that new user joined
    // as the user already joined the room so he also can get the emailId of the new user *****
  socket.broadcast.to(roomId).emit("new-user-joined-room", { emailId });
//   Socket.io sends the event to every socket connected to the room except the sender. So if the first user is already in the room and has an event listener for "new-user-joined-room", they will receive the broadcast message when a new user joins.
});
    // socket.on("join-room",(data)=>{
    //     const {emailId,roomId} = data;
    //     // now brodcase it to the room that new user joinef
    //     socket.join(roomId);
    //     console.log("User joined room:", roomId, emailId);
    //     // here we will emit the same socket id to the user who joined the room
    //     // so that he can redirect to the room page
    //     socket.emit("joined-room-conformation",roomId)
    //     emailToSocketId.set(emailId,socket.id);
    //  socket.broadcast.to(roomId).emit("user-connected", { emailId });

    // })

    socket.on('call-new-user',(data)=>{
        const {emailId,offer} = data;
        // we will get the socketId of the 2nd user  , as we cant send the offer to the emailId of the new user
        const socketId = emailToSocketId.get(emailId);
        const fromEmailId = socketIdToEmail.get(socket.id); 
        // this the qst user email id we is calling 
        socket.to(socketId).emit('incomming-call',{from:fromEmailId,  offer});
    })

     socket.on('call-accepted',(data)=>{
        const {emailId,answer} = data;
        // this is the first user email id who called us 
        const socketId = emailToSocketId.get(emailId); 
        socket.to(socketId).emit('call-accepted-by-user',{answer,emailId});
     })

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Express API route
app.get("/", (req, res) => {
    res.send("Express + Socket.io Server is Running");
});

// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Flow
// 1. User connects to the server
// 2. User emits a "join-room" event to join a room
// 3. Server adds the user to the room and emits a "joined-room-conformation" event to the user
// 4. Server broadcasts a "new-user-joined-room" event to all users in the room , if a new user joins the room


// 5. now the first user will send the offer to the new user who joined the room
// 5.1-> first we get the public ip address of our machine using the STUN server
// 5.2-> then we create the offer and set the local description of the peer
// 5.3-> then we send the offer to the new user who joined the room