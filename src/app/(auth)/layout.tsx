import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import type { safeGetUser } from "@/convex/users";
import { getToken } from "@/lib/auth-server";
import { Header } from "./_components/header";

type CurrentUser = NonNullable<Awaited<ReturnType<typeof safeGetUser>>>;

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const token = await getToken();

  if (!token) {
    redirect("/sign-in");
  }

  const currentUser = await getCurrentUser(token);

  if (!currentUser) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header
        user={{
          email: currentUser.email,
          name: currentUser.name,
          image: currentUser.image ?? undefined,
        }}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}

async function getCurrentUser(token: string): Promise<CurrentUser | null> {
  const result = await fetchQuery(
    api.users.getCurrentUser,
    {},
    { token },
  ).catch((error) => {
    console.error("Failed to load current user", error);
    return null;
  });

  if (!result) {
    return null;
  }

  return result;
}
