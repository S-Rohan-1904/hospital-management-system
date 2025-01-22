"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useAuthContext } from "@/context/AuthContext";
import { useHospitalsContext } from "@/context/HospitalsContext";
import {
  Home,
  Settings,
  CalendarCheck2,
  ScrollText,
  MessageCircleMore,
  Hospital,
} from "lucide-react";
import { ChevronUp, User2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateRoomButton from "./CreateRoomButton";

// Menu items with role-based access.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ["hospital", "doctor", "patient"], // Accessible by all roles
  },
  {
    title: "Appointments",
    url: "/dashboard/appointments",
    icon: CalendarCheck2,
    roles: ["doctor", "patient"],
  },
  {
    title: "Medical History",
    url: "/dashboard/medical-history",
    icon: ScrollText,
    roles: ["doctor", "patient"], // Not accessible by admin
  },
  {
    title: "Scans",
    url: "/dashboard/scans",
    icon: ScrollText,
    roles: ["doctor", "patient", "scanCentre"],
  },
  {
    title: "Chat",
    url: "/chat-app/chat",
    icon: MessageCircleMore,
    roles: ["scanCentre", "doctor", "patient"],
  },
  {
    title: "Room Manangement",
    url: "/dashboard/room-management",
    icon: Hospital,
    roles: ["hospitalAdmin"],
  },
];

export function AppSidebar() {
  const { setAppointments } = useAppointmentsContext();
  const { setHospitals } = useHospitalsContext();
  const { logout, currentUser } = useAuthContext();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      setAppointments([]);
      setHospitals([]);
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  // Filter items based on user's role
  const filteredItems = items.filter((item) =>
    item.roles.includes(currentUser?.role)
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-bold font-sans text-[1.25rem] my-2 pl-5">
            Hospital Management System
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-lg p-5 hover:pl-7">
                    <Link href={item.url}>
                      <item.icon />
                      <span className="ml-1">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {currentUser?.fullName}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem onClick={handleSignOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
