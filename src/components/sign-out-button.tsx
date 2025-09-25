"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const handleSignOut = async () => {
    setLoading(true);
    await authClient.signOut();
    setLoading(false);
    router.push("/sign-in");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={loading}
    >
      <LogOutIcon />
      Sign Out
    </Button>
  );
}
