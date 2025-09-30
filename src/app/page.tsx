import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";

export default async function Home() {
  const token = await getToken();

  if (token) {
    const currentUser = await fetchQuery(
      api.users.getCurrentUser,
      {},
      { token },
    ).catch(() => null);

    if (currentUser) {
      redirect("/workspace");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      dasdsa
    </main>
  );
}
