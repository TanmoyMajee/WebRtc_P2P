const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON request bodies

const server = http.createServer(app); // Create HTTP server

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (Adjust for security)
        methods: ["GET", "POST"]
    }
});

 const emailToSocketId = new Map();
    const socketIdToEmail = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (data) => {
        const { emailId, roomId } = data;
        // before join in the room we emmit in taht room that user joined [ it will go to all the user who are in the room]
        io.to(roomId).emit("new-user-joined-room", { emailId, socketId: socket.id }); // as A is alrady joind so hw will get B's Details
        socket.join(roomId);
        emailToSocketId.set(emailId, socket.id);
        socketIdToEmail.set(socket.id, emailId);
        console.log("User joined room", roomId, emailId);
      io.to(socket.id).emit("joined-room", { emailId, roomId});
        // socket.to()
    });

    socket.on("call-new-user", (data) => { 
        const { socketId, offer , emailId } = data;  // this socket id is B's socketId || emailId is A's ID
        // const socketId = emailToSocketId.get(emailId);
        if(! socketId || !offer) console.log("Remote Socket Id or Offer is not present");
        console.log("offer ans sockei is : ",offer,socketId )
        io.to(socketId).emit("incomming-call", { offer, socketId: socket.id , emailId }); // socktid is A's socketId
    });

    socket.on("call-accepted",(data)=>{
        const { socketId, answer } = data; // this is User A's socket id
        // now pass the ans to user A 
        io.to(socketId).emit("finala-ans",{answer,socketId:socket.id}) // pass the ans and the socket id of user B sdf
    })

    socket.on('peer:nego:needed',(data)=>{
      const {offer , remoteSocketId } = data; // A create the offer agin and give it B [remoteId is B's Id]
      io.to(remoteSocketId).emit("peer:nego:incomming",{offer,from : socket.id}); // from is user A's ID
    })

    socket.on("peer:nego:done",(data)=>{
        const {to,answer} = data; // answe is B's answer and we send it back to A || to is A's sckt id
        io.to(to).emit("peer:nego:final",{answer,from:socket.id}); 
    })

});

// Express API route
app.get("/", (req, res) => {
    res.send("Express + Socket.io Server is Running");
});

// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
