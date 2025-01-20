import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

let roomUsers = {};

io.on("connection", (socket) => {
  io.emit("users_response", roomUsers);
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    roomUsers = {
      ...roomUsers,
      [roomId]: [...(roomUsers[roomId] || []), socket.id],
    };

    io.emit("users_response", roomUsers);
    console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const { roomId, senderId, text, createdAt } = data;

      const message = new ChatMessage({
        chatGroup: roomId,
        sender: senderId,
        message: text,
        createdAt,
      });

      await message.save();

      io.to(roomId).emit("receive_message", {
        chatGroup: roomId,
        sender: senderId,
        message: text,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing_response", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected " + socket.id);
    for (const [roomId, users] of Object.entries(roomUsers)) {
      if (users.includes(socket.id)) {
        roomUsers[roomId] = [...users.filter((id) => id !== socket.id)];
        io.emit("receive_message", {
          text: "A user left the room.",
          socketId: "kurakani",
          roomId: roomId,
        });
      }
    }
    io.emit("users_response", roomUsers);
  });
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//routes

import userRouter from "./routes/user.routes.js";
import hospitalRouter from "./routes/hospital.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import scanRequestRouter from "./routes/scanRequest.routes.js";
import medicalHistoryRouter from "./routes/medicalHistory.routes.js";
import chatRouter from "./routes/chat.routes.js";
import roomManagementRouter from "./routes/roomManagement.routes.js";

app.use("/api/v1/users/", userRouter);
app.use("/api/v1/appointments/", appointmentRouter);
app.use("/api/v1/hospital/", hospitalRouter);
app.use("/api/v1/scan/", scanRequestRouter);
app.use("/api/v1/history/", medicalHistoryRouter);
app.use("/api/v1/chat/", chatRouter);
app.use("/api/v1/room/", roomManagementRouter);

export default app;
