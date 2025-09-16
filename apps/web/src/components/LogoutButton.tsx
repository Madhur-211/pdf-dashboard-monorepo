"use client";

import { clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push("/login"); // redirect to login page
  }

  return (
    <Button onClick={handleLogout} variant="destructive">
      Logout
    </Button>
  );
}
