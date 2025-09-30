import Link from "next/link";
import { LogoWithText } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <LogoWithText className="size-8 text-primary" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/workspace">Workspace</Link>
          </Button>
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
