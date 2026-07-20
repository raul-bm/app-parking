import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const userSockets = new Map<number, Set<string>>();

let io: Server | null = null;

export function setupSocket(httpServer: any) {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "https://app-parking-raulbm.numinformatica.com",
        "http://localhost:5173",
        "http://localhost:3000",
      ],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));

    try {
      const secret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, secret) as any;
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    socket.on("disconnect", () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  return io;
}

export function notifyUser(userId: number, event: string, data?: any) {
  const sockets = userSockets.get(userId);

  if (sockets && io) {
    for (const socketId of sockets) {
      io.to(socketId).emit(event, data);
    }
  }
}
