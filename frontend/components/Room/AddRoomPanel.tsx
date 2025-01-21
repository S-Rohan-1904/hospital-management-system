"use client";

import { useRoom } from "@/context/RoomContext";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AiFillCloseCircle } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch"; // ShadCN Switch component
import { Label } from "../ui/label"; // ShadCN Label component
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"; // ShadCN Popover
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command"; // ShadCN Command components
import { Check } from "lucide-react"; // Icons

function AddRoomPanel({ hideAddRoomPanel }: any) {
  const [title, setTitle] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [isGroupChat, setIsGroupChat] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null); // Selected user ID
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>(""); // Selected specialization
  const {
    myRooms,
    setMyRooms,
    fetchUsersByRole,
    users,
    createIndividualRoom,
    createSpecializationRoom,
    fetchRoomsFromServer,
    setRooms,
  } = useRoom(); // Get users and function
  const router = useRouter();
  const specialization = ["Pediatrics", "Orthopedics", "Gynecology"]; // Specialization options

  // Fetch users and update state on mount
  useEffect(() => {
    setId(uuidv4());
    fetchUsersByRole(); // Fetch users by role (adjust role as needed)
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isGroupChat) {
      createSpecializationRoom(selectedSpecialization); // Use selected specialization for group chat
    } else {
      createIndividualRoom(selectedUser); // Use selected user for individual chat
    }
    setMyRooms([
      ...myRooms,
      {
        title,
        _id: id,
        groupchat: isGroupChat,
      },
    ]);
    fetchRoomsFromServer(setRooms);
    hideAddRoomPanel(true);
    router.refresh();
    // router.replace("/chat-app/chat/" + id);
  };

  return (
    <div
      className="flex absolute top-0 left-0 z-20 flex-col justify-center items-center px-6 py-8 mx-auto w-full h-screen backdrop-blur-sm bg-black/50"
      onClick={() => hideAddRoomPanel(true)}
    >
      <div
        className="relative w-full bg-slate-900 rounded-lg shadow-lg md:mt-0 sm:max-w-md xl:p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <AiFillCloseCircle
          size={30}
          className="absolute -top-2 -right-2 cursor-pointer text-sky-500"
          onClick={() => hideAddRoomPanel(true)}
        />
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold tracking-tight leading-tight text-slate-50 md:text-2xl">
            Create Chat
          </h1>

          {/* Toggle for Group Chat */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="groupchat" className="text-slate-400">
              Group Chat
            </Label>
            <Switch
              id="groupchat"
              checked={isGroupChat}
              onCheckedChange={(value) => setIsGroupChat(value)}
            />
          </div>

          {/* Conditional User Selector for Individual Chat */}
          {!isGroupChat && (
            <div className="space-y-2">
              <Label>Select User</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={!!selectedUser}
                    className="w-full justify-between"
                  >
                    {selectedUser
                      ? users.find((user) => user._id === selectedUser)
                          ?.fullName
                      : "Select User..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0">
                  <Command>
                    <CommandList>
                      {users.length > 0 ? (
                        <CommandGroup>
                          {users.map((user) => (
                            <CommandItem
                              key={user._id}
                              value={user._id}
                              onSelect={(currentValue) => {
                                setSelectedUser(currentValue);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedUser === user._id
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <div>
                                <p>{user.fullName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : (
                        <CommandEmpty>No users found.</CommandEmpty>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Dropdown for Specialization */}
          {isGroupChat && (
            <div className="space-y-2">
              <Label>Select Specialization</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={!!selectedSpecialization}
                    className="w-full justify-between"
                  >
                    {selectedSpecialization
                      ? selectedSpecialization
                      : "Select Specialization..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0">
                  <Command>
                    <CommandList>
                      {specialization.length > 0 ? (
                        <CommandGroup>
                          {specialization.map((spec, index) => (
                            <CommandItem
                              key={index}
                              value={spec}
                              onSelect={(currentValue) => {
                                setSelectedSpecialization(currentValue);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedSpecialization === spec
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <div>
                                <p>{spec}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : (
                        <CommandEmpty>No specializations found.</CommandEmpty>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Button
            type="submit"
            className="btn bg-sky-500 text-white hover:bg-sky-600 w-full"
            onClick={handleSubmit}
          >
            {isGroupChat ? "Create Group Chat" : "Create Individual Chat"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddRoomPanel;
