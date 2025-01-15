import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ScanDescriptionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description?: string | null;
}
export function ScanDescription({
  open,
  onOpenChange,
  description,
}: ScanDescriptionProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="scan-description">
        <DialogHeader>
          <DialogTitle>Description</DialogTitle>
        </DialogHeader>
        <DialogDescription id="scan-description">
          {description}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
