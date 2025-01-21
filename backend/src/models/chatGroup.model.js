import mongoose from "mongoose";

const chatGroupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
    },
    groupchat: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ChatGroup = mongoose.model("ChatGroup", chatGroupSchema);
