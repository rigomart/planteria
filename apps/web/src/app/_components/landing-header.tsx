import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Github from "@/components/icons/github";
import { LogoWithText } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 sm:px-8">
      <Link
        href="/"
        className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
      >
        <LogoWithText size={36} />
      </Link>
      <nav className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="inline-flex">
          <Link href="https://github.com/rigomart/planteria" target="_blank" rel="noreferrer">
            <Github />
          </Link>
        </Button>

        <Button asChild variant="ghost" className="text-sm">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild className="text-sm">
          <Link href="/sign-up" className="flex items-center gap-1">
            Sign up
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </nav>
    </header>
  );
}
