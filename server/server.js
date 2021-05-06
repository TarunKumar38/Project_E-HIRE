const express = require("express");
const http = require("http");
const app = express();

const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  // socket.emit("connected", socket.id);
	socket.on("join-room", (roomId) => {
		socket.join(roomId);
		socket.on("textChanged", (text) => {
			// console.log(text, "server");
			// io.broadcast("textChanged", text);
			socket.broadcast.to(roomId).emit("textChanged1", text);
		});
	});
});

server.listen(5000, () => {
  console.log("server is listening on port 5000");
});
