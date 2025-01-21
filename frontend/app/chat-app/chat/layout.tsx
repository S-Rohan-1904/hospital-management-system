import RoomSideBar from "@/components/Room/RoomSideBar";

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <RoomSideBar />
      {children}
    </div>
  );
}
