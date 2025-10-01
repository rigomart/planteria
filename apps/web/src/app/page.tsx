import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";
import { HeroSection } from "./_components/hero-section";
import { LandingHeader } from "./_components/landing-header";

export default async function Home() {
  const token = await getToken();

  if (token) {
    const currentUser = await fetchQuery(api.users.getCurrentUser, {}, { token }).catch(() => null);

    if (currentUser) {
      redirect("/workspace");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <LandingHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 pb-12 sm:px-8 lg:gap-10 pt-4">
        <HeroSection />

        <section className="rounded-3xl border border-primary/20 bg-primary/10 px-6 py-8 text-center shadow-lg shadow-primary/15 dark:bg-primary/15">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-[2.15rem]">
              Keep your mission, outcomes, and actions aligned as you ship.
            </h2>
            <p className="text-balance text-sm text-muted-foreground sm:text-base">
              Create your first plan now and see how Planteria keeps every collaborator focused on
              the smallest shippable slice.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button asChild size="lg" className="text-sm sm:text-base">
                <Link href="/sign-up">Create an account</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-sm sm:text-base">
                <Link href="/sign-in">Already onboard? Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
