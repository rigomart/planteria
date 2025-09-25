import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getToken } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";
import { Header } from "./_components/header";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const token = await getToken();

  if (!token) {
    redirect("/sign-in");
  }

  try {
    const currentUser = await fetchQuery(
      api.users.getCurrentUser,
      {},
      { token },
    );

    if (!currentUser) {
      redirect("/sign-in");
    }
  } catch (error) {
    console.error(error);
    redirect("/sign-in");
  }

  return (
    <div>
      <Header />
      {children}
    </div>
  );
}
