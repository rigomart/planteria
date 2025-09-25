import { SignOutButton } from "@/components/sign-out-button";

export function Header() {
  return (
    <header className="flex justify-between items-center p-4 shadow">
      <div className="flex items-center gap-2">Planteria</div>
      <SignOutButton />
    </header>
  );
}
