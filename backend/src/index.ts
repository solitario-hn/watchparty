import express, { type Request, type Response } from "express";
import cors from "cors";
import http from "http";
import { randomUUID } from "node:crypto";
import { Server, type Socket } from "socket.io";
import dotenv from "dotenv";
import path from "path";

dotenv.config(); // Load environment variables from .env file

interface SubtitleState {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface RoomState {
  roomId: string;
  videoUrl: string;
  playing: boolean;
  currentTime: number;
  playbackRate: number;
  updatedAt: number;
  subtitle: SubtitleState[];
  selectedSubtitle: string;
}

const app = express();
app.use(cors());
app.use(express.json()); //express returns response in raw data parsing to json.
app.use(express.static(path.join(__dirname, "public"))); //to serve static files from public folder

const httpserver = http.createServer(app);
const SocketIO = new Server(httpserver, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"], // Allow GET and POST methods
  },
});

const rooms = new Map<string, RoomState>();

SocketIO.on("connection", (socket: Socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joined_room", (data) => {
    const roomId = data.roomId;
    const userName = data.userName;

    if (socket.data.roomId) socket.leave(socket.data.roomId);

    socket.data.roomId = roomId;
    socket.data.userName = userName;
    socket.join(roomId);

    const room = rooms.get(roomId);
    if (!room) {
      rooms.set(roomId, {
        roomId: roomId,
        videoUrl: "",
        playing: false,
        currentTime: 0,
        playbackRate: 1,
        updatedAt: Date.now(),
        subtitle: [],
        selectedSubtitle: "",
      });
    }
  });

  socket.on("chat_message", (data) => {
    const roomId = socket.data.roomId;
    const message = data;

    const messageforMap = {
      id: randomUUID(),
      message: message,
      userName: socket.data.userName,
      sendAt: new Date().toISOString(),
    };

    socket.to(roomId).emit("chat_message", messageforMap);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

httpserver.listen(3000, () => {
  console.log("Server is running on port 3000");
});
