import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gym Tracker",
  description: "Web app para registrar rutinas, sesiones y progreso del sistema Gym Tracker."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
