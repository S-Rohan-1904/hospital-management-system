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
    createdAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
