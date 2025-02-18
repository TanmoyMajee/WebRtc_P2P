
import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../provider/Socket';
import { useNavigate } from 'react-router-dom';

function Home() {
const navigate = useNavigate();
  const [room, setRoom] = useState("");
  const [email, setEmail] = useState("");
  const { socket } = useContext(SocketContext);

  const RoomRedirect = (roomId) => {
      navigate(`/room/${roomId}`);
  };

  useEffect(() => {
    if (!socket) return;

    console.log("Registering event listeners");

    socket.on("joined-room-conformation", (roomId) => {
      // console.log("Joined room:", roomId);
      RoomRedirect(roomId);
    });

    // socket.on("user-connected", ({ emailId }) => {
    //   console.log("User connected:", emailId);
    // });

    return () => {
      console.log("Cleaning up event listeners");
      socket.off("joined-room-conformation");
      socket.off("user-connected");
    };
  }, [socket]);

  const handleJoinRoom = () => {
    if (socket) {
      console.log("Emitting join-room event");
      socket.emit("join-room", { emailId: email, roomId: room });
    } else {
      console.error("Socket is not connected yet.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-700">Join a Room</h2>
        <input 
          type="text" 
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter room name" 
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email" 
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleJoinRoom}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Home;