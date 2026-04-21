import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionSync } from "@/components/auth-session-sync";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
      <body>
        <AuthSessionSync />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
