import { Server } from "socket.io";
import { Server as httpServerInterface } from "http";
import { SocketRoomArgs, SocketStoryArgs } from "../types";

let websocketServer: Server;

export const io = {
  init: (httpServer: httpServerInterface) => {
    websocketServer = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["OPTIONS", "PUT", "PATCH", "DELETE", "GET", "POST"],
      },
    });
    return websocketServer;
  },
  getIO: () => {
    if (!websocketServer) {
      throw new Error("Socket.io is not initialized");
    }
    return websocketServer;
  },
  run: () => {
    io.getIO().on("connection", (socket) => {
      socket.on("room", (args: SocketRoomArgs) => {
        switch (args.action) {
          case "join":
            socket.join(args.id);
            socket.broadcast.to(args.id).emit("session", {
              action: "join",
              username: args.username,
              role: args.role,
            });
            console.log("\n****************join***************\n");
            break;

          case "leave":
            socket.leave(args.id);
            console.log("\n****************leave***************\n");
            break;

          default:
            break;
        }
      });

      socket.on("story", (args: SocketStoryArgs) => {
        switch (args.action) {
          case "vote":
            socket
              // .in(args.sessionId)
              .emit("story", { action: "vote", id: args.storyId });
            console.log("\n**********voting**********\n");
            break;

          default:
            break;
        }
      });
    });
  },
};
