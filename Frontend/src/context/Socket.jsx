import React, { createContext, useContext, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(); // Explicitly export here

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    return io("http://localhost:5000");
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}> {/* Provide as an object */}
      {children}
    </SocketContext.Provider>
  );
};
