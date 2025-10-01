import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";
import { FeaturesSection } from "./_components/features-section";
import { FlowSection } from "./_components/flow-section";
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

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 pb-10 sm:px-8 lg:gap-20 pt-3">
        <HeroSection />

        <FeaturesSection />
        <FlowSection />

        <section className="rounded-3xl border border-primary/20 bg-primary/10 px-5 py-6 text-center shadow-lg shadow-primary/15 dark:bg-primary/15">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-[1.85rem]">
              Keep your mission, outcomes, and actions aligned as you ship.
            </h2>
            <p className="text-balance text-sm text-muted-foreground">
              Create your first plan now and see how Planteria keeps every collaborator focused on
              the smallest shippable slice.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button asChild size="default" className="text-sm">
                <Link href="/sign-up">Create an account</Link>
              </Button>
              <Button asChild variant="ghost" size="default" className="text-sm">
                <Link href="/sign-in">Already onboard? Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
