import express, { type Request, type Response } from "express";
import cors from "cors";
import http from "http";
import { Server, type Socket } from "socket.io";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(express.json()); //express returns response in raw data parsing to json.

const server = http.createServer(app);
app.get("/", (req: Request, res: Response) => {
  res.json({
    array: [1, 2, 3],
    boolean: true,
    color: "gold",
    null: null,
    object: {
      a: "b",
      c: "d",
    },
    string: "Hello World",
  });
});
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
