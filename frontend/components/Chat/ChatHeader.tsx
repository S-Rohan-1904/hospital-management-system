"use client";
import { useRoom } from "@/context/RoomContext";
import React, { useState } from "react";
import Popup from "../shared/Popup";

function ChatHeader({ roomId }: { roomId: string }) {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { rooms, myRooms } = useRoom();
  const room = rooms.concat(myRooms).find((room) => room._id === roomId);
  return (
    <div className="basis-[7%] border-b-2 flex items-center justify-between p-3 font-medium">
      <p className="text-xl">{room?.title}</p>

      <Popup
        text="Room ID copied!"
        showPopup={isCopied}
        setShowPopup={setIsCopied}
      />
    </div>
  );
}

export default ChatHeader;
