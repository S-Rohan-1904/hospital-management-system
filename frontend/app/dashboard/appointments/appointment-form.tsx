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
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { AppointmentInterface } from "@/app/dashboard/appointments/appointments-client";

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: AppointmentInterface | null;
}

export function AppointmentForm({
  open,
  onOpenChange,
  appointment = null,
}: AppointmentFormProps) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    try {
      if (appointment) {
        // await updateAppointment(appointment._id, formData);
      } else {
        // await createAppointment(formData);
      }
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      // You could add error handling UI here
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Edit Appointment" : "Create Appointment"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {/* <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={appointment?.title}
            />
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="date">Start Date & Time</Label>
            <Input
              id="start-date"
              name="start-date"
              type="datetime-local"
              required
              defaultValue={appointment?.startTime}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">End Date & Time</Label>
            <Input
              id="end-date"
              name="end-date"
              type="datetime-local"
              required
              defaultValue={appointment?.endTime}
            />
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={appointment?.description}
            />
          </div> */}
          <div className="flex justify-end">
            <Button type="submit">{appointment ? "Update" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
