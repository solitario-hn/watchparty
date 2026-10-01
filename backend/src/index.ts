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

// SocketIO connection event listener
// SocketIO is listening for connection events from clients.
// socket is an individual connection to a client. Each client has its own socket connection.
// socket.on() listen to
// socket.emit()
// socket.broadcast()
// SocketIO.emit()
// SokcetIO.to(roomid).emit()
// socket.to(roomid).emit()

SocketIO.on("connection", (socket: Socket) => {
  //SocketIO (har ek individual bande ki request listen kar raha main connection)
  console.log("A user connected:", socket.id);

  socket.on("joined_room", async (data) => {
    const roomId = data.roomId;
    const userName = data.userName;
    if (socket.data.roomId) socket.leave(socket.data.roomId);

    socket.data.roomId = roomId;
    socket.data.userName = userName;
    socket.join(roomId);

    const clients = await SocketIO.in(roomId).fetchSockets();
    const users = clients.map((client) => ({
      socketId: client.id,
      userName: client.data.userName,
    }));
    SocketIO.to(roomId).emit("room_members", users);

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
    } else {
      socket.emit("video_link", room.videoUrl); //emits to the listener to the client side who just joined the room.
    }

    const systemMessage = {
      keyId: randomUUID(),
      userName: "system",
      message: `${socket.data.userName} joined the party.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    SocketIO.to(roomId).emit("chat_message", systemMessage); //backend is emiting the message to all the connected clients.
  });

  socket.on("change_userName", async (data) => {
    socket.data.userName = data;

    const clients = await socket.in(socket.data.roomId).fetchSockets();
    const users = clients.map((client) => ({
      socketId: client.id,
      userName: client.data.userName,
    }));

    socket.emit("room_members", users);
  });

  socket.on("chat_message", (data) => {
    //backend is listening from the socketClient.
    console.log(data);
    const newMessage = {
      roomId: socket.data.roomId,
      userName: socket.data.userName,
      message: data,
    };

    SocketIO.to(socket.data.roomId).emit("chat_message", newMessage); //backend will emit to the client (except the sender that is listening/call the chat_message initially.)
  });

  /////listening video url change

  socket.on("video_link", (data) => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);
    if (!room) {
      return;
    } else {
      room.videoUrl = data;
      SocketIO.to(roomId).emit("video_link", data); //emits the url change to all the users backened in the room.(including sender)
    }
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected:", socket.id);

    const clients = await socket.in(socket.data.roomId).fetchSockets();
    const users = clients.map((client) => ({
      socketId: client.id,
      userName: client.data.userName,
    }));

    SocketIO.to(socket.data.roomId).emit("room_members", users);
    //generating system message.
    const systemMessage = {
      keyId: randomUUID(),
      userName: "system",
      message: `${socket.data.userName} disconnected from the room.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    SocketIO.to(socket.data.roomId).emit("chat_message", systemMessage); //backend is emiting the message to all the connected clients.
  });
});

httpserver.listen(3000, () => {
  console.log("Server is running on port 3000");
});
