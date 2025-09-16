"use client";

import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Welcome to Dashboard 🎉</h1>
          <LogoutButton />
        </div>
        <p>Only logged-in users can see this page.</p>
      </main>
    </AuthGuard>
  );
}
