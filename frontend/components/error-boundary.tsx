"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: string;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error details:", {
      error,
    });
  }, [error]);

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl">
        <Alert variant="destructive">
          <AlertTitle>Something went wrong!</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              {error || "An unexpected error occurred. Please try again."}
            </p>
            <Button onClick={reset} variant="outline" size="sm">
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
