import UserProvider from "@/context/UserContext";
import "./globals.css";
import localFont from "next/font/local";
import { Metadata } from "next";
import "react-tooltip/dist/react-tooltip.css";
import RoomProvider from "@/context/RoomContext";
import SocketProvider from "@/context/SocketContext";
const calibre = localFont({
  src: [
    { path: "../../public/fonts/CalibreRegular.otf", weight: "normal" },
    { path: "../../public/fonts/CalibreMedium.otf", weight: "500" },
    { path: "../../public/fonts/CalibreLight.otf", weight: "300" },
    { path: "../../public/fonts/CalibreSemibold.otf", weight: "600" },
    { path: "../../public/fonts/CalibreBold.otf", weight: "bold" },
  ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserProvider>
        <RoomProvider>
          <SocketProvider>
            <main className={calibre.className}>{children}</main>
          </SocketProvider>
        </RoomProvider>
      </UserProvider>
    </>
  );
}
