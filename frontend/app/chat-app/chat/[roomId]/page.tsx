"use client";

import ChatBody from "@/components/Chat/ChatBody";
import ChatFooter from "@/components/Chat/ChatFooter";
import ChatHeader from "@/components/Chat/ChatHeader";
import { useAuthContext } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";

function Page() {
  const { roomId } = useParams();

  // Ensure `roomId` is a string
  const validatedRoomId = Array.isArray(roomId) ? roomId[0] : roomId;
  const router = useRouter();
  const { socket, roomUsers } = useSocket();
  const { currentUser, fetchAuthStatus } = useAuthContext();
  useEffect(() => {
    if (!currentUser) {
      router.replace("/chat-app/chat"); // Redirect after the component is mounted
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (!validatedRoomId) return; // Avoid errors if `validatedRoomId` is null or undefined

    if (roomUsers[validatedRoomId]?.includes(socket?.id)) return;

    socket?.emit("send_message", {
      text: currentUser?.fullName + " joined the room.",
      socketId: socket.id,
      roomId: validatedRoomId,
    });
    socket?.emit("join_room", validatedRoomId);
  }, [validatedRoomId, roomUsers, socket, currentUser]);

  return (
    <div className="flex relative flex-col w-full h-screen">
      <ChatHeader roomId={validatedRoomId} />
      <ChatBody roomId={validatedRoomId} />
      <ChatFooter roomId={validatedRoomId} />
    </div>
  );
}

export default Page;
