"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

type BaseUser = {
  name?: string;
  email?: string;
  image?: string;
};

export type UserMenuProps = {
  user: BaseUser;
};

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = user?.name?.trim() || "User";
  const displayEmail = user?.email?.trim() || undefined;
  const initials = getInitials(displayName, displayEmail);

  const handleSignOut = async () => {
    if (signingOut) {
      return;
    }

    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/sign-in");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={signingOut}>
        <button
          type="button"
          className="cursor-pointer flex items-center gap-2 rounded-none p-2 transition-all duration-100 hover:bg-accent"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight max-w-32">
            <span className="truncate font-medium">{user.name}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-52 p-2">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium" title={user.name}>
                {user.name}
              </span>
              <span className="truncate text-xs" title={user.email}>
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(event) => {
            event.preventDefault();
            void handleSignOut();
          }}
          className="flex items-center gap-2 text-sm font-medium cursor-pointer"
        >
          <LogOutIcon className="size-4" />
          {signingOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getInitials(name: string, email?: string) {
  const source = name || email || "User";
  const matches = source
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const initials = matches.slice(0, 2);

  return initials || "U";
}
