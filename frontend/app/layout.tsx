import { AppointmentsProvider } from "../context/AppointmentsContext";
import { HospitalsProvider } from "../context/HospitalsContext";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { MedicalHistoryProvider } from "@/context/MedicalHistoryContext";
import { ScansProvider } from "@/context/ScansContext";
import { RoomManagementProvider } from "@/context/RoomManagementContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Hospital Management System</title>
      </head>
      <body>
        <AuthProvider>
          <MedicalHistoryProvider>
            <HospitalsProvider>
              <RoomManagementProvider>
                <AppointmentsProvider>
                  <ScansProvider>{children}</ScansProvider>
                </AppointmentsProvider>
              </RoomManagementProvider>
            </HospitalsProvider>
          </MedicalHistoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
