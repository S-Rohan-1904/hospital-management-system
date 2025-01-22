import { useSocket } from "@/context/SocketContext";
import React, { useRef, useState } from "react";
import { AiFillLike } from "react-icons/ai";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend, IoMdCloseCircle } from "react-icons/io";
import Picker from "emoji-picker-react";
import { useAuthContext } from "@/context/AuthContext";

function ChatFooter({ roomId }: { roomId: string }) {
  const [message, setMessage] = useState<string>("");
  const { socket } = useSocket();
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const inputRef = useRef<any | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const { currentUser } = useAuthContext();

  const onEmojiPick = (emojiObj: any) => {
    setMessage((prevInput) => prevInput + emojiObj.emoji);
    inputRef.current.focus();
    setShowEmojiPicker(false);
  };

  const handleSendMessage = (e: any, message: string) => {
    e.preventDefault();

    // Debugging info
    console.log("Message send initiated");

    // Ensure message or image exists before sending
    if (message.trim() || image) {
      socket?.emit("send_message", {
        text: message, // The message content
        senderId: currentUser._id, // Current user's ID
        roomId, // Target room ID
        name: currentUser.fullName, // Current user's full name
      });

      console.log("Message sent:", {
        text: message,
        senderId: currentUser._id,
        roomId,
        name: currentUser.fullName,
      });
    } else {
      console.error("Cannot send an empty message or image.");
    }

    // Reset input fields
    setMessage("");
    setImage(null);
  };

  const handleTyping = () => {
    socket?.emit(
      "typing",
      message ? currentUser.fullName + " is typing ..." : ""
    );
  };

  return (
    <>
      {image && (
        <div className="relative border border-primary rounded-lg max-w-[6rem] h-24 ml-4 mb-2 shadow-md">
          <IoMdCloseCircle
            size={20}
            className="absolute -right-2 -top-2 cursor-pointer text-destructive hover:text-destructive-foreground"
            onClick={() => setImage(null)}
          />
          <img
            src={image}
            alt="Selected"
            className="w-full h-full object-contain rounded-md"
          />
        </div>
      )}
      <div className="basis-[8%] border-t p-3 flex items-center gap-4 bg-card">
        <div className="relative w-full">
          <div className="absolute bottom-12 right-0">
            {showEmojiPicker && (
              <Picker
                onEmojiClick={onEmojiPick}
                previewConfig={{ showPreview: false }}
                className="z-50 shadow-md bg-popover"
              />
            )}
          </div>
          <BsEmojiSmileFill
            size={24}
            className="cursor-pointer absolute top-[6px] right-3 text-muted hover:text-primary"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
          <form onSubmit={(e) => handleSendMessage(e, message)}>
            <input
              ref={inputRef}
              type="text"
              value={message}
              className="w-full h-10 px-4 bg-input border border-border rounded-md text-sm placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary"
              placeholder="Type a message..."
              onKeyUp={handleTyping}
              onChange={(e) => {
                setMessage(e.target.value), setShowEmojiPicker(false);
              }}
            />
          </form>
        </div>
        {message.length === 0 && !image ? (
          <AiFillLike
            size={32}
            className="cursor-pointer text-muted hover:text-primary"
            onClick={(e) => handleSendMessage(e, "👍")}
          />
        ) : (
          <IoMdSend
            size={32}
            className="cursor-pointer text-primary hover:text-primary-foreground"
            onClick={(e) => handleSendMessage(e, message)}
          />
        )}
      </div>
    </>
  );
}

export default ChatFooter;
