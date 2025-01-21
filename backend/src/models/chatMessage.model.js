import mongoose from "mongoose";

const Schema = mongoose.Schema;

const chatMessageSchema = new Schema(
  {
    chatGroup: {
      type: Schema.Types.ObjectId,
      ref: "ChatGroup",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    socketId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` timestamps
  }
);

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
