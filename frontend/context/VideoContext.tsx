"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the context
interface UserContextType {
  fullName: string;
  setFullName: (name: string) => void;
}

// Create context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to use the context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Props type for the provider
interface UserProviderProps {
  children: ReactNode;
}

// Context provider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [fullName, setFullName] = useState<string>("");

  return (
    <UserContext.Provider value={{ fullName, setFullName }}>
      {children}
    </UserContext.Provider>
  );
};
