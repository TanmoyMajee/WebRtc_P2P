
import React, { useState, useEffect, useCallback, useContext } from "react";
import { SocketContext } from "../context/Socket"; // Correct import
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { socket } = useContext(SocketContext);
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log(email, room);

      socket.emit("join-room", { emailId: email, roomId: room });
    },
    [email, room, socket]
  );

  const handleRoomJoin = useCallback(
    (data) => {
      const { emailId, roomId } = data;
      console.log("User joined room:", roomId, emailId);
      navigate(`/room/${roomId}`,{ state: { email } });
    },
    [navigate,email] // Corrected the dependencies as email is used inside the callback
  );

  useEffect(() => {
    if (!socket) return;

    console.log("Registering event listeners");

    socket.on("joined-room", handleRoomJoin);

    return () => {
      console.log("Cleaning up event listeners");
      socket.off("joined-room", handleRoomJoin);
    };
  }, [socket, handleRoomJoin]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Join a Room</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Enter room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
          >
            Find & Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;