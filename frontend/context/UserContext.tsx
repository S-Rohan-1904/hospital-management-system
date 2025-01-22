"use client";

import IUserContext from "@/interfaces/IUserContext";
import { createContext, useContext, useState } from "react";
import { useAuthContext } from "./AuthContext";
const intialData: IUserContext = {
  username: "",
  setUsername: () => {},
};

const UserContext = createContext<IUserContext>(intialData);

export function useUser() {
  const context = useContext(UserContext);
  const { currentUser } = useAuthContext();
  if (context.username !== "") {
    return context;
  } else if (currentUser) {
    return {
      ...context,
      username: currentUser.fullName,
    };
  } else {
    return context;
  }
}

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [username, setUsername] = useState<string>("");

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
