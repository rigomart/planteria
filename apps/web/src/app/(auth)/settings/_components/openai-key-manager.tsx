"use client";

import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Loader2, Save, Trash2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";

dayjs.extend(relativeTime);

const MIN_KEY_LENGTH = 24;

export function OpenAIKeyManager() {
  const status = useQuery(api.userApiKeys.getOpenAIKeyStatus);
  const saveKey = useMutation(api.userApiKeys.saveOpenAIKey);
  const deleteKey = useMutation(api.userApiKeys.deleteOpenAIKey);

  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const trimmedKey = apiKey.trim();
  const canSubmit =
    trimmedKey.startsWith("sk-") && trimmedKey.length >= MIN_KEY_LENGTH && !isSubmitting;

  const lastUpdated = useMemo(() => {
    if (!status?.hasKey || !status.updatedAt) {
      return null;
    }

    return dayjs(status.updatedAt).fromNow();
  }, [status]);

  if (status === undefined) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>Checking OpenAI connection…</span>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await saveKey({ apiKey: trimmedKey });
      toast.success(`OpenAI key saved (…${result.lastFour}).`);
      setApiKey("");
    } catch (error) {
      console.error("Failed to save OpenAI key", error);
      const message = error instanceof Error ? error.message : "Failed to save key";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteKey({});

      if (result.status === "missing") {
        toast.info("No key on file to remove.");
      } else {
        toast.success("OpenAI key removed.");
      }
    } catch (error) {
      console.error("Failed to delete OpenAI key", error);
      const message = error instanceof Error ? error.message : "Failed to delete key";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">OpenAI access</h2>
          <p className="text-sm text-muted-foreground">
            Your key is only used to call OpenAI on your behalf while generating or adjusting plans.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API key</Label>
            <Input
              id="openai-key"
              type="password"
              autoComplete="off"
              placeholder="sk-..."
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {status?.hasKey ? "Update key" : "Save key"}
            </Button>

            {status?.hasKey ? (
              <Button type="button" variant="ghost" disabled={isDeleting} onClick={handleDelete}>
                {isDeleting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 size-4" />
                )}
                Remove key
              </Button>
            ) : null}
          </div>
        </form>

        {status?.hasKey ? (
          <div className="mt-4 rounded-xl border border-border/50 bg-muted/10 p-4 text-sm">
            <p>
              Active key ending in <span className="font-semibold">{status.lastFour}</span>
            </p>
            {lastUpdated ? <p className="text-muted-foreground">Updated {lastUpdated}</p> : null}
          </div>
        ) : (
          <Alert className="mt-4 border-yellow-500/40 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100">
            <AlertTitle>Key required</AlertTitle>
            <AlertDescription className="text-sm">
              Plans can only be generated once you provide a valid OpenAI API key above.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="rounded-2xl border border-border/40 bg-muted/10 p-4 text-sm text-muted-foreground">
        <p>Tip: monitor usage inside your OpenAI dashboard and rotate this key if needed.</p>
      </div>
    </section>
  );
}
