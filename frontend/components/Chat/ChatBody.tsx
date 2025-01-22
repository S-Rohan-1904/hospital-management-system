"use client";
import { useAuthContext } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import React, { useEffect, useRef, useState } from "react";
import Avatar from "react-avatar";

function ChatBody({ roomId }: { roomId: string }) {
  const [typing, setTyping] = useState<string>("");
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { messages, socket } = useSocket();
  const { currentUser } = useAuthContext();

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket?.on("typing_response", (data) => {
      setTyping(data);
    });
  }, []);
  messages[roomId]?.map((message: any, index: number) => {
    console.log("message", message);
    console.log("socket.id", socket.id);
  });

  return (
    <div className="basis-[85%] overflow-y-auto p-4 w-full flex flex-col gap-4 bg-background">
      {messages[roomId]?.map((message: any, index: number) =>
        message.socketId === "kurakani" ? (
          // System Messages
          <div className="flex self-center" key={index}>
            <p className="px-3 py-1 text-sm italic text-muted-foreground bg-muted rounded-lg">
              {message.message}
            </p>
          </div>
        ) : message.socketId === socket?.id ||
          message.name === currentUser.fullName ? (
          // Own Messages
          <div className="flex self-end flex-col items-end gap-1" key={index}>
            {message.message && (
              <div className="px-4 py-2 text-sm italic text-black bg-white rounded-lg rounded-br-none shadow-md">
                {message.message}
              </div>
            )}
            {message.image && (
              <div className="rounded-lg shadow-md">
                <img
                  src={message.image}
                  alt="message"
                  className="max-w-xs rounded-lg"
                />
              </div>
            )}
          </div>
        ) : (
          // Other User Messages
          <div className="flex items-start gap-3 self-start" key={index}>
            <Avatar
              name={message.name}
              round={true}
              size="35"
              className="text-sm"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {message.name}
              </p>
              {message.message && (
                <div className="px-4 py-2 text-sm bg-muted rounded-lg rounded-bl-none shadow-md">
                  {message.message}
                </div>
              )}
              {/* {message.image && (
                <div className="rounded-lg shadow-md">
                  <img
                    src={message.image}
                    alt="message"
                    className="max-w-xs rounded-lg"
                  />
                </div>
              )} */}
            </div>
          </div>
        )
      )}
      {/* Typing Indicator */}
      <div
        ref={lastMessageRef}
        className="mt-auto text-sm italic text-muted-foreground"
      >
        {typing}
      </div>
    </div>
  );
}

export default ChatBody;
