import type { Metadata } from "next";
import type { ReactNode } from "react";
import AuthStatus from "@/components/AuthStatus";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Tracker",
  description: "Track projects and their progress.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">
        <div className="mx-auto flex max-w-6xl justify-end px-6 pt-5 sm:px-10">
          <AuthStatus />
        </div>
        {children}
      </body>
    </html>
  );
}
