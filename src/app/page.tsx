"use client";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useConvexAuth,
  useQuery,
} from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const tasks = useQuery(api.tasks.get);
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Unauthenticated>Logged out</Unauthenticated>
      <Authenticated>Logged in</Authenticated>
      <AuthLoading>Loading...</AuthLoading>
      {tasks?.map(({ _id, text }) => (
        <div key={_id} className="text-2xl font-bold">
          {text}
        </div>
      ))}

      {isLoading && <div>Loading...</div>}
      {isAuthenticated && <div>Authenticated</div>}
      {!isAuthenticated && <div>Unauthenticated</div>}
    </main>
  );
}
