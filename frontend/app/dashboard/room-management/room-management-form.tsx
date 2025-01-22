"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoomManagementContext } from "@/context/RoomManagementContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface RoomAllotmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: string | null;
}

export function RoomAllotmentForm({
  open,
  onOpenChange,
  room = null,
}: RoomAllotmentFormProps) {
  console.log(room);

  const { allotRoom, changeRoom } = useRoomManagementContext();
  const [wardType, setWardType] = useState<string>("General Ward");
  const [email, setEmail] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (room) {
      setWardType("General Ward");
      setEmail(room);
    }
  }, [room]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (!email.trim()) {
        toast({
          title: "Error",
          description: "Please provide a valid email.",
          variant: "destructive",
        });
        return;
      }
      if (room) {
        await changeRoom(wardType, email);
        toast({
          title: "Success",
          description: "Room changed successfully.",
          variant: "default",
        });
      } else {
        await allotRoom(wardType, email);
        toast({
          title: "Success",
          description: "Room allotted successfully.",
          variant: "default",
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to allot room. Please try again.",
        variant: "destructive",
      });
      console.error("Error allotting room:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {room ? "Edit Room Allotment" : "Allot Room"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ward-type">Ward Type</Label>
            <Select
              name="ward-type"
              value={wardType}
              onValueChange={(value) => setWardType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Ward Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General Ward">General Ward</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!room && (
            <div className="space-y-2">
              <Label htmlFor="email">Patient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter patient email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={!email.trim()}>
              {room ? "Update" : "Allot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
