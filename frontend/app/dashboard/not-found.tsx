import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold">Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          Could not find the requested resource.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
