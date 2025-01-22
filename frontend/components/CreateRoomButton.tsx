// /components/CreateRoomButton.tsx
"use client";

import { useRouter } from "next/navigation";

interface CreateRoomButtonProps {
  meetingId: string; // Add meetingId prop
}

const CreateRoomButton: React.FC<CreateRoomButtonProps> = ({ meetingId }) => {
  const router = useRouter();

  const handleCreateRoom = () => {
    console.log("Meeting ID:", meetingId); // Log the meeting ID if needed
    router.push(`/room/${meetingId}`);
  };

  return (
    <button
      onClick={handleCreateRoom}
      className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
    >
      Create Room
    </button>
  );
};

export default CreateRoomButton;
