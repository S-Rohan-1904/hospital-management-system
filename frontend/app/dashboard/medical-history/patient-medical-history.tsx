"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/context/AuthContext";
import { useMedicalHistoryContext } from "@/context/MedicalHistoryContext";
import { format } from "date-fns";
import { FileText, Calendar } from "lucide-react";
import { useEffect } from "react";

export default function PatientMedicalHistory() {
  const { medicalHistory, fetchMedicalHistory } = useMedicalHistoryContext();
  const { currentUser } = useAuthContext();
  useEffect(() => {
    console.log(medicalHistory);
  });

  useEffect(() => {
    if (currentUser) {
      fetchMedicalHistory(currentUser._id, currentUser.role);
    }
  }, []);
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medical History</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {medicalHistory.map((record) => (
          <Card key={record._id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {record.diagnosis}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 ">
                <div className="flex items-center gap-2 flex-row">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(record.startDate), "P")}
                  </div>
                  {" - "}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(record.endDate), "P")}
                  </div>
                </div>

                <p className="text-sm">{record.description}</p>
                {record.diagnosis && (
                  <div className="pt-2">
                    <strong className="text-sm">Diagnosis:</strong>
                    <p className="text-sm text-muted-foreground">
                      {record.diagnosis}
                    </p>
                  </div>
                )}
                {record.description && (
                  <div className="pt-2">
                    <strong className="text-sm">Description:</strong>
                    <p className="text-sm text-muted-foreground">
                      {record.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
