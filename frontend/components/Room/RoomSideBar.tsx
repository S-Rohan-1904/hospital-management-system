"use client";

import React, { useEffect, useState } from "react";
import RoomCard from "./RoomCard";
import IRoom from "@/interfaces/IRoom";
import { useRoom } from "@/context/RoomContext";
import { useSocket } from "@/context/SocketContext";
import { BiMessageAdd } from "react-icons/bi";
import AddRoomPanel from "./AddRoomPanel";
import { ChevronUp, HomeIcon, User2 } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarMenuButton } from "../ui/sidebar";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

function RoomSideBar() {
  const [showAddRoomPanel, setShowAddRoomPanel] = useState(false);
  const { rooms, fetchRoomsFromServer, setRooms } = useRoom();
  const { roomUsers } = useSocket();
  const { currentUser } = useAuthContext();

  const { logout } = useAuthContext();
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  const hideAddRoomPanel = () => setShowAddRoomPanel(false);

  useEffect(() => {
    fetchRoomsFromServer(setRooms);
  }, []);

  return (
    <div className="flex h-screen w-20 flex-col overflow-y-auto border-r bg-background sm:w-1/4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold sm:text-2xl">Rooms</h1>
        <Link href={"/dashboard"}>
          <HomeIcon />
        </Link>
      </div>

      {/* My Rooms Section */}
      <div className="flex-grow border-t p-4">
        <h2 className="mb-2 text-lg font-medium sm:text-xl">My Rooms</h2>
        <div className="space-y-2">
          {rooms.map((room: IRoom, index) => (
            <RoomCard
              key={index}
              room={room}
              users={roomUsers.room?._id ?? []}
            />
          ))}
        </div>
      </div>

      {/* Add Room Button */}
      <div className="p-4">
        <button
          onClick={() => setShowAddRoomPanel(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-primary/10 px-3 py-2 text-primary transition hover:bg-primary hover:text-background"
        >
          <BiMessageAdd size={24} />
          <span className="hidden sm:block text-sm font-medium">Add Room</span>
        </button>
      </div>

      {/* Add Room Panel */}
      {showAddRoomPanel && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md">
          <AddRoomPanel hideAddRoomPanel={hideAddRoomPanel} />
        </div>
      )}

      {/* Current User Section - Pinned to Bottom */}
      {currentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <User2 /> {currentUser?.fullName}
              <ChevronUp className="ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export default RoomSideBar;
