import { preloadQuery } from "convex/nextjs";
import { getToken } from "@/lib/auth-server";
import { api } from "../../convex/_generated/api";

export default async function Home() {
  const token = await getToken();

  const _preloadedUser = await preloadQuery(
    api.users.getCurrentUser,
    {},
    { token },
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      dasdsa
    </main>
  );
}
