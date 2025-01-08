import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppointmentDescriptionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description?: string | null;
}
export function AppointmentDescription({
  open,
  onOpenChange,
  description,
}: AppointmentDescriptionProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="appointment-description">
        <DialogHeader>
          <DialogTitle>Description</DialogTitle>
        </DialogHeader>
        <DialogDescription id="appointment-description">
          {description}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
