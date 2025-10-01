import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";

export default async function UnauthLayout({ children }: { children: ReactNode }) {
  const token = await getToken();

  if (!token) {
    return <>{children}</>;
  }

  const currentUser = await fetchQuery(api.users.getCurrentUser, {}, { token }).catch(() => null);

  if (currentUser) {
    redirect("/workspace");
  }

  return <>{children}</>;
}
