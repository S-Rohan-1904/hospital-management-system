"use client";

import IMessage from "@/interfaces/IMessage";
import ISocketContext from "@/interfaces/ISocketContext";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./UserContext";
import { useRouter } from "next/navigation";

const initialData: ISocketContext = {
  socket: undefined,
  roomUsers: {},
  messages: {},
};

const SocketContext = createContext<ISocketContext>(initialData);

export function useSocket() {
  return useContext(SocketContext);
}

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [roomUsers, setRoomUsers] = useState<Record<string, string[]>>({});
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<{ [key: string]: IMessage[] }>({});

  const { username } = useUser();

  const router = useRouter();

  useEffect(() => {
    const socket = io(
      "https://hospital-management-system-backend-lewn.onrender.com"
    );

    socket.on("connect", () => {
      console.log("Connected to the socket server!");
      console.log(socket.id);

      setSocket(socket);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    socket.on("users_response", (data) => {
      console.log("Received users response:", data);
      setRoomUsers(data);
    });

    socket.on("receive_message", (data: IMessage) => {
      console.log("Received message:", data);

      // Update messages for the specific chatGroup
      setMessages((prev) => ({
        ...prev,
        [data.chatGroup]: [...(prev[data.chatGroup] ?? []), data],
      }));
    });

    // Handle chat history
    socket.on("chat_history", (chatHistory: IMessage[]) => {
      if (chatHistory.length > 0) {
        const chatGroup = chatHistory[0].chatGroup; // Assume all messages belong to the same group
        console.log("Received chat history for group:", chatGroup);

        setMessages((prev) => ({
          ...prev,
          [chatGroup]: chatHistory, // Replace existing messages for this group with the chat history
        }));
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [username, router]);

  return (
    <SocketContext.Provider value={{ socket, roomUsers, messages }}>
      {children}
    </SocketContext.Provider>
  );
}
