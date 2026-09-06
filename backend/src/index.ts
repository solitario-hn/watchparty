import express, { type Request, type Response } from "express";
import cors from "cors";
import http from "http";
import { Server, type Socket } from "socket.io";
import dotenv from "dotenv";
import path from "path";

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(express.json()); //express returns response in raw data parsing to json.
app.use(express.static(path.join(__dirname, "public"))); //to serve static files from public folder

/// hii anaya wassup
// are u good
// good morning in voice chat
/// hahahaahaha
// feet check plz
// fit check plz

const server = http.createServer(app);
app.get("/", (req: Request, res: Response) => {
  //get to give response to the user without any data asked. / post is used when client has to provide some set of pre-data and then response in provided.
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/sleep", (req: Request, res: Response) => {
  console.log(req.query); //query returns all the parameters with the url/route
  console.log(req.body); //body returns custom data which user can attach with the reuqest(different formats)
  res.json({
    sleep: "sleep",
  });
});
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
