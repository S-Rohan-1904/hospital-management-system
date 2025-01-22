"use client";

import IRoom from "@/interfaces/IRoom";
import IRoomContext from "@/interfaces/IRoomContext";
import axiosInstance from "@/utils/axiosInstance";
import { createContext, useContext, useEffect, useState } from "react";
import { Dispatch, SetStateAction } from "react";

const initialData: IRoomContext = {
  rooms: [],
  myRooms: [],
  users: [], // New state for users
  setMyRooms: () => {},
  fetchUsersByRole: async () => {}, // New function to fetch users by role
  createIndividualRoom: async () => {},
  createSpecializationRoom: async () => {},
  fetchRoomsFromServer: async () => {},
  setRooms: () => {},
};

const RoomContext = createContext<IRoomContext>(initialData);

export function useRoom() {
  return useContext(RoomContext);
}

export default function RoomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [myRooms, setMyRooms] = useState<IRoom[]>([]);
  const [users, setUsers] = useState<any[]>([]); // State to hold fetched users

  useEffect(() => {
    fetchRoomsFromServer(setRooms);
  }, []);

  useEffect(() => {
    updateMyRooms();
  }, [myRooms]);

  async function fetchRoomsFromServer(
    setRooms: Dispatch<SetStateAction<IRoom[]>>
  ): Promise<void> {
    try {
      console.log("Fetching rooms from server...");

      const response = await axiosInstance.get("/chat", {
        withCredentials: true,
      });
      console.log("response.data.data", response.data.data);

      setRooms(response.data.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }

  function fetchMyRooms() {
    const myRooms = localStorage.getItem("myRooms");
    if (myRooms) setMyRooms(JSON.parse(myRooms));
    else setMyRooms([]);
  }

  function updateMyRooms() {
    localStorage.setItem("myRooms", JSON.stringify(myRooms));
  }

  // Function to create an individual room
  async function createIndividualRoom(userId: string) {
    try {
      const response = await axiosInstance.post(
        "/chat/create",
        { userId },
        { withCredentials: true }
      );
      console.log("Room created:", response.data);
      fetchRoomsFromServer(setRooms);

      // Update the myRooms state after creating the room
      const newRoom = response.data.room;
      setMyRooms((prev) => [...prev, newRoom]);
    } catch (error) {
      console.error("Error creating individual room:", error);
    }
  }

  // Function to create a room based on specialization
  async function createSpecializationRoom(specialization: string) {
    try {
      const response = await axiosInstance.post(
        "/chat/create/specialization",
        { specialization },
        { withCredentials: true }
      );
      fetchRoomsFromServer(setRooms);
      console.log("Specialization room created:", response.data);

      // Update the myRooms state after creating the room
      const newRoom = response.data.room;
      setMyRooms((prev) => [...prev, newRoom]);
    } catch (error) {
      console.error("Error creating specialization room:", error);
    }
  }

  // Function to fetch users by role
  async function fetchUsersByRole() {
    try {
      const response = await axiosInstance.get(`/chat/users`, {
        withCredentials: true,
      });
      console.log("Users fetched by role:", response.data.data);

      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users by role:", error);
    }
  }

  return (
    <RoomContext.Provider
      value={{
        rooms,
        myRooms,
        users, // Expose users state
        setMyRooms,
        fetchUsersByRole, // Expose fetchUsersByRole function
        createIndividualRoom,
        createSpecializationRoom,
        fetchRoomsFromServer,
        setRooms,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}
