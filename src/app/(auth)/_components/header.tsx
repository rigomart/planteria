import Link from "next/link";
import type { UserMenuProps } from "./user-menu";
import { UserMenu } from "./user-menu";

type HeaderProps = {
  user: UserMenuProps["user"];
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4">
        <Link href="/workspace" className="group flex items-center gap-1">
          <span className="grid size-8 place-items-center rounded-sm bg-gradient-to-br from-emerald-400 to-green-700 text-lg font-semibold text-white shadow-sm">
            P
          </span>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-green-400">
              Planteria
            </span>
          </div>
        </Link>

        <UserMenu user={user} />
      </div>
    </header>
  );
}
