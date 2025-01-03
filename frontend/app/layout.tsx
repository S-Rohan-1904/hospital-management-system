import { AppointmentsProvider } from "../context/AppointmentsContext";
import "./globals.css";

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
        <AppointmentsProvider>{children}</AppointmentsProvider>
      </body>
    </html>
  );
}
