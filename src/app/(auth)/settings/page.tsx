import { Header } from "../_components/header";
import { SettingsContent } from "./_components/settings-content";

export default function SettingsPage() {
  return (
    <>
      <Header />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage the credentials Planteria uses to generate and share your
            plans.
          </p>
        </div>

        <SettingsContent />
      </div>
    </>
  );
}
