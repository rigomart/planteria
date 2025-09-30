import { LogoWithText } from "@/components/logo";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4">
        <LogoWithText className="size-8 text-primary" />

        <UserMenu />
      </div>
    </header>
  );
}
