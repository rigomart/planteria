import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";

export default async function UnauthLayout({ children }: { children: ReactNode }) {
  const token = await getToken();

  const unauthHeader = (
    <header className="w-full border-b fixed">
      <div className="p-4">
        <Link href="/" aria-label="Go to home" className="inline-flex items-center text-foreground">
          <Logo size={32} />
        </Link>
      </div>
    </header>
  );

  if (!token) {
    return (
      <>
        {unauthHeader}
        {children}
      </>
    );
  }

  const currentUser = await fetchQuery(api.users.getCurrentUser, {}, { token }).catch(() => null);

  if (currentUser) {
    redirect("/workspace");
  }

  return (
    <>
      {unauthHeader}
      {children}
    </>
  );
}
