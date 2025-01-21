import { useRoom } from "@/context/RoomContext";
import IRoom from "@/interfaces/IRoom";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import Avatar from "react-avatar";
import { ImExit } from "react-icons/im";
function RoomCard({ room, users }: { room: IRoom; users: string[] }) {
  const { roomId } = useParams();
  const { myRooms, setMyRooms } = useRoom();
  const router = useRouter();
  console.log(myRooms);

  const handleLeaveRoom = () => {
    setMyRooms(myRooms.filter((r) => r._id !== room._id));
  };

  return (
    <div
      onClick={() => {
        router.replace("/chat-app/chat/" + room._id);
      }}
      className={`group relative flex items-center gap-3 rounded-lg p-3 transition ${
        room?._id === roomId
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted hover:text-foreground"
      }`}
    >
      {/* Avatar or Image */}
      <div>
        {room?._id === "1" ? (
          <Image
            src="/images/globe.jpg"
            height={50}
            width={50}
            className="h-12 w-12 rounded-full object-cover"
            alt="Room"
          />
        ) : (
          <Avatar
            name={room?.title}
            round={true}
            size="48"
            className="text-sm"
          />
        )}
      </div>

      {/* Room Details */}
      <div className="hidden sm:block">
        <p className="text-sm font-medium leading-tight">{room?.title}</p>
      </div>

      {/* Leave Room Button */}
      {room._id !== "1" && (
        <button
          onClick={(e) => {
            e.preventDefault(); // Prevent navigation on button click
            handleLeaveRoom();
          }}
          className="absolute right-3 hidden rounded-full bg-destructive p-2 text-destructive-foreground hover:bg-destructive/80 group-hover:flex"
        >
          <ImExit size={16} />
        </button>
      )}
    </div>
  );
}

export default RoomCard;
