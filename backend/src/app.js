import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { ChatMessage } from "./models/chatMessage.model.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://hospital-management-system-prod.vercel.app",
    ],
  },
  maxHttpBufferSize: 2e7, // 20 MB for file uploads
});

let roomUsers = {};

// Your socket events
io.on("connection", (socket) => {
  io.emit("users_response", roomUsers);
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    // Check if the user is already in the room
    if (roomUsers[roomId] && roomUsers[roomId].includes(socket.id)) {
      // If the user is already in the room, send feedback and do nothing
      socket.emit("error", `You are already in room ${roomId}`);
      return; // Exit the function without adding the user again
    }

    // If not, join the room
    socket.join(roomId);

    // Add user to the room's list of users
    roomUsers = {
      ...roomUsers,
      [roomId]: [...(roomUsers[roomId] || []), socket.id],
    };

    // Emit updated room users to all clients
    io.emit("users_response", roomUsers);
    console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const { roomId, senderId, text, name } = data;

      // Debugging received data
      console.log("Message received:", data);

      // Save message to the database
      const message = new ChatMessage({
        socketId: socket.id,
        chatGroup: roomId,
        sender: senderId,
        message: text,
        name: name,
      });

      await message.save();

      // Emit the saved message to users in the same room
      io.to(roomId).emit("receive_message", {
        socketId: socket.id,
        chatGroup: roomId,
        sender: senderId,
        message: text,
        name: name,
      });

      console.log("Message saved and emitted:", {
        socketId: socket.id,
        chatGroup: roomId,
        sender: senderId,
        message: text,
        name: name,
      });
    } catch (error) {
      console.error("Error saving or emitting message:", error);
    }
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing_response", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected " + socket.id);
    for (const [roomId, users] of Object.entries(roomUsers)) {
      if (users.includes(socket.id)) {
        roomUsers[roomId] = users.filter((id) => id !== socket.id);
        io.emit("receive_message", {
          text: `user ${socket.id} left the room.`,
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
    origin: [
      "http://localhost:3000",
      "https://hospital-management-system-prod.vercel.app",
    ],
    credentials: true,
  })
);

// Routes (your API endpoints)
import userRouter from "./routes/user.routes.js";
import hospitalRouter from "./routes/hospital.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import scanRequestRouter from "./routes/scanRequest.routes.js";
import medicalHistoryRouter from "./routes/medicalHistory.routes.js";
import chatRouter from "./routes/chat.routes.js";
import paymentRouter from "./routes/paymentgateway.routes.js";

app.use("/api/v1/users/", userRouter);
app.use("/api/v1/appointments/", appointmentRouter);
app.use("/api/v1/hospital/", hospitalRouter);
app.use("/api/v1/scan/", scanRequestRouter);
app.use("/api/v1/history/", medicalHistoryRouter);
app.use("/api/v1/chat/", chatRouter);
app.use("/api/v1/payment/", paymentRouter);

export { server };
