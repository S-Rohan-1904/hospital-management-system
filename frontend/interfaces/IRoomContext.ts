import IRoom from "./IRoom";

export default interface IRoomContext {
  rooms: IRoom[];
  myRooms: IRoom[];
  users: any[]; // Array to hold the fetched users
  setMyRooms: React.Dispatch<React.SetStateAction<IRoom[]>>;
  createIndividualRoom: (userId: string) => Promise<void>;
  createSpecializationRoom: (specialization: string) => Promise<void>;
  fetchUsersByRole: () => Promise<void>;
  fetchRoomsFromServer: (
    setRooms: React.Dispatch<React.SetStateAction<IRoom[]>>
  ) => Promise<void>; // Accept setRooms as argument
  setRooms: React.Dispatch<React.SetStateAction<IRoom[]>>;
}
