
import { io, Socket } from "socket.io-client";

let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5050", {
      transports: ["websocket"],
    });
  }

  return socket;
};