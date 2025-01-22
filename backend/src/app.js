import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { ChatMessage } from "./models/chatMessage.model.js";
import { sendEmail } from "./utils/emailService.js";
import Agenda from 'agenda';

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

  socket.on("join_room", async (roomId) => {
    try {
      if (roomUsers[roomId] && roomUsers[roomId].includes(socket.id)) {
        socket.emit("error", `You are already in room ${roomId}`);
        return;
      }

      socket.join(roomId);

      roomUsers = {
        ...roomUsers,
        [roomId]: [...(roomUsers[roomId] || []), socket.id],
      };

      io.emit("users_response", roomUsers);

      const chatHistory = await ChatMessage.find({ chatGroup: roomId })
        .sort({ createdAt: 1 })
        .select("chatGroup sender message name createdAt");

      socket.emit("chat_history", chatHistory);

      console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    } catch (error) {
      console.error("Error handling join_room event:", error);
      socket.emit("error", "An error occurred while joining the room.");
    }
  });

  // Leave Room Event
  socket.on("leave_room", (roomId, callback) => {
    try {
      if (!roomUsers[roomId] || !roomUsers[roomId].includes(socket.id)) {
        const message = `You are not part of room ${roomId}`;
        console.error(message);
        if (callback) callback({ success: false, message });
        return;
      }

      // Leave the room
      socket.leave(roomId);

      // Remove the user from the room's user list
      roomUsers[roomId] = roomUsers[roomId].filter((id) => id !== socket.id);

      // Notify others in the room
      io.to(roomId).emit("receive_message", {
        text: `User ${socket.id} has left the room.`,
        roomId,
      });

      // Emit the updated room users
      io.emit("users_response", roomUsers);
      console.log("roomUsers", roomUsers);

      console.log(`User with ID: ${socket.id} left room: ${roomId}`);
      if (callback)
        callback({ success: true, message: "Successfully left the room" });
    } catch (error) {
      console.error("Error handling leave_room event:", error);
      if (callback)
        callback({
          success: false,
          message: "An error occurred while leaving the room.",
        });
    }
  });

  socket.on("send_message", async (data) => {
    try {
      const { roomId, senderId, text, name } = data;

      console.log("Message received:", data);

      const message = new ChatMessage({
        socketId: socket.id,
        chatGroup: roomId,
        sender: senderId,
        message: text,
        name,
      });

      await message.save();

      io.to(roomId).emit("receive_message", {
        socketId: socket.id,
        chatGroup: roomId,
        sender: senderId,
        message: text,
        name,
      });

      console.log("Message saved and emitted:", {
        socketId: socket.id,
        chatGroup: roomId,
        sender: senderId,
        message: text,
        name,
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
          text: `User ${socket.id} left the room.`,
          roomId,
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
import roomManagementRouter from "./routes/roomManagement.routes.js";

app.use("/api/v1/users/", userRouter);
app.use("/api/v1/appointments/", appointmentRouter);
app.use("/api/v1/hospital/", hospitalRouter);
app.use("/api/v1/scan/", scanRequestRouter);
app.use("/api/v1/history/", medicalHistoryRouter);
app.use("/api/v1/chat/", chatRouter);
app.use("/api/v1/payment/", paymentRouter);
app.use("/api/v1/room",roomManagementRouter);

const agenda = new Agenda({ db: { address: `${process.env.MONGODB_URI}/agenda` } });

agenda.define('send email', async (job) => {
  const { to, subject, text , html} = job.attrs.data;
  await sendEmail({ to, subject, text , html});
});

agenda.start();


export { server , agenda};
