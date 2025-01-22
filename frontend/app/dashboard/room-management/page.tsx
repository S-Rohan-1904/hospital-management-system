"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoomManagementContext } from "@/context/RoomManagementContext";
import { Plus, MoreVertical, Calendar } from "lucide-react";
import { format } from "date-fns-tz";
import { RoomAllotmentForm } from "./room-management-form";
import Loading from "../loading";
import { OrderFoodForm } from "./food-order-form";

export default function RoomManagementPage() {
  const {
    wards,
    occupiedBeds,
    loading,
    error,
    fetchWards,
    fetchOccupiedBeds,
    fetchFoodAvailable,
    dischargePatient,
  } = useRoomManagementContext();

  const [formOpen, setFormOpen] = useState(false);
  const [orderFoodDialogOpen, setOrderFoodDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    fetchWards();
    fetchOccupiedBeds();
    setSelectedRoom(null);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Allot Room
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="my-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Room Number</TableHead>
              <TableHead>Admission Date</TableHead>
              <TableHead>Discharge Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {occupiedBeds.map((room) => (
              <TableRow key={room.patientId}>
                <TableCell>{room.fullName}</TableCell>
                <TableCell>{room.ward}</TableCell>
                <TableCell>
                  {room.floor}
                  {"0"}
                  {room.bedNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(room.admissionDate), "dd/MM/yyyy")}{" "}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {room.dischargeDate !== "Still Admitted"
                      ? format(new Date(room.dischargeDate), "dd/MM/yyyy")
                      : "Still Admitted"}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      {room.dischargeDate === "Still Admitted" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRoom(room.email);
                              setFormOpen(true);
                            }}
                          >
                            Change Room
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              fetchFoodAvailable();
                              setOrderFoodDialogOpen(true);
                              setSelectedRoom(room.email);
                            }}
                          >
                            Order Food
                          </DropdownMenuItem>
                        </>
                      )}
                      {room.dischargeDate === "Still Admitted" && (
                        <DropdownMenuItem
                          onClick={() => {
                            dischargePatient(room.email);
                          }}
                        >
                          Discharge Paitent
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Room Allotment Form */}
      <RoomAllotmentForm
        open={formOpen}
        onOpenChange={(isOpen) => {
          setFormOpen(isOpen);
          if (!isOpen) {
            setSelectedRoom(null); // Reset room when form closes
          }
        }}
        room={selectedRoom}
      />

      {/* Order Food Form */}
      <OrderFoodForm
        open={orderFoodDialogOpen}
        onOpenChange={(isOpen) => {
          setOrderFoodDialogOpen(isOpen);
          if (!isOpen) {
            setSelectedRoom(null); // Reset room when form closes
          }
        }}
        room={selectedRoom}
      />
    </div>
  );
}
