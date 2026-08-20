import { io } from "socket.io-client";
import { Socket } from "socket.io-client";

let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("https://blog-app-server-virid.vercel.app", {
      transports: ["websocket"],
      autoConnect: true,
    });
  }

  return socket;
};
