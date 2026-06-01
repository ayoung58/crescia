"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-lg">Crescia</span>
        <SignOutButton redirectUrl="/">
          <Button variant="outline">Sign Out</Button>
        </SignOutButton>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
