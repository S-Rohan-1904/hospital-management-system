import { AppointmentsProvider } from "../context/AppointmentsContext";
import { HospitalsProvider } from "../context/HospitalsContext";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { MedicalHistoryProvider } from "@/context/MedicalHistoryContext";
import { ScansProvider } from "@/context/ScansContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

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
        <GoogleOAuthProvider clientId="117839731186-0vl1vchrk5on1bol3mledra6840ckvbd.apps.googleusercontent.com">
          <AuthProvider>
            <MedicalHistoryProvider>
              <HospitalsProvider>
                <AppointmentsProvider>
                  <ScansProvider>{children}</ScansProvider>
                </AppointmentsProvider>
              </HospitalsProvider>
            </MedicalHistoryProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
