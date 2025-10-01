"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";

function formatUpdatedAt(timestamp?: number) {
  if (!timestamp) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Something went wrong";
}

export function SettingsContent() {
  const [openAiInput, setOpenAiInput] = useState("");
  const [isSavingOpenAi, setIsSavingOpenAi] = useState(false);
  const [isDeletingOpenAi, setIsDeletingOpenAi] = useState(false);
  const [isGeneratingPlanteriaKey, setIsGeneratingPlanteriaKey] = useState(false);
  const [isRevokingPlanteriaKey, setIsRevokingPlanteriaKey] = useState(false);
  const [revealedPlanteriaKey, setRevealedPlanteriaKey] = useState<string | null>(null);

  const openAiStatus = useQuery(api.userApiKeys.getOpenAIKeyStatus);
  const planteriaStatus = useQuery(api.userApiKeys.getPlanteriaApiKeyStatus);

  const saveOpenAiKey = useMutation(api.userApiKeys.saveOpenAIKey);
  const deleteOpenAiKey = useMutation(api.userApiKeys.deleteOpenAIKey);
  const generatePlanteriaApiKey = useMutation(api.userApiKeys.generatePlanteriaApiKey);
  const deletePlanteriaApiKey = useMutation(api.userApiKeys.deletePlanteriaApiKey);

  useEffect(() => {
    if (!planteriaStatus?.hasKey) {
      setRevealedPlanteriaKey(null);
    }
  }, [planteriaStatus?.hasKey]);

  const openAiStatusLine = useMemo(() => {
    if (openAiStatus === undefined) {
      return "Checking for a saved key...";
    }

    if (!openAiStatus.hasKey) {
      return "No OpenAI key on file.";
    }

    return `Key ending in ${openAiStatus.lastFour} updated ${formatUpdatedAt(openAiStatus.updatedAt)}.`;
  }, [openAiStatus]);

  const planteriaStatusLine = useMemo(() => {
    if (planteriaStatus === undefined) {
      return "Checking API key state...";
    }

    if (!planteriaStatus.hasKey) {
      return "No Planteria API key has been generated.";
    }

    return `Key ending in ${planteriaStatus.lastFour} updated ${formatUpdatedAt(planteriaStatus.updatedAt)}.`;
  }, [planteriaStatus]);

  async function handleSaveOpenAiKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!openAiInput.trim()) {
      toast.error("Enter a valid OpenAI API key before saving.");
      return;
    }

    setIsSavingOpenAi(true);
    try {
      const result = await saveOpenAiKey({ apiKey: openAiInput });
      toast.success(`OpenAI key saved. Ending in ${result.lastFour}.`);
      setOpenAiInput("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingOpenAi(false);
    }
  }

  async function handleDeleteOpenAiKey() {
    if (!openAiStatus?.hasKey) {
      return;
    }

    const confirmed = window.confirm(
      "Removing your OpenAI key will disable plan generation. Continue?",
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingOpenAi(true);
    try {
      await deleteOpenAiKey({});
      toast.success("OpenAI key removed.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeletingOpenAi(false);
    }
  }

  async function handleGeneratePlanteriaKey() {
    setIsGeneratingPlanteriaKey(true);
    try {
      const result = await generatePlanteriaApiKey({});
      setRevealedPlanteriaKey(result.apiKey);
      toast.success("Planteria API key generated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsGeneratingPlanteriaKey(false);
    }
  }

  async function handleRevokePlanteriaKey() {
    if (!planteriaStatus?.hasKey) {
      return;
    }

    const confirmed = window.confirm(
      "This will revoke access for any MCP client using the current key. Continue?",
    );

    if (!confirmed) {
      return;
    }

    setIsRevokingPlanteriaKey(true);
    try {
      await deletePlanteriaApiKey({});
      toast.success("Planteria API key revoked.");
      setRevealedPlanteriaKey(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsRevokingPlanteriaKey(false);
    }
  }

  async function handleCopyPlanteriaKey() {
    if (!revealedPlanteriaKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(revealedPlanteriaKey);
      toast.success("API key copied to clipboard.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const isOpenAiLoading = openAiStatus === undefined;
  const isPlanteriaLoading = planteriaStatus === undefined;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>OpenAI API key</CardTitle>
          <CardDescription>
            Planteria runs all plan generation through your OpenAI account. We store your key
            obfuscated and only use it for your requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSaveOpenAiKey}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="openai-key">
                OpenAI API key
              </label>
              <Input
                type="password"
                placeholder="sk-..."
                value={openAiInput}
                onChange={(event) => setOpenAiInput(event.target.value)}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Example: sk-live-xxxxxxxx. Saving a new key replaces the previous one immediately.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={isSavingOpenAi || isOpenAiLoading}>
                {isSavingOpenAi ? "Saving..." : "Save key"}
              </Button>
              {openAiStatus?.hasKey ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteOpenAiKey}
                  disabled={isDeletingOpenAi}
                >
                  {isDeletingOpenAi ? "Removing..." : "Remove key"}
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-xs text-muted-foreground">{openAiStatusLine}</span>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planteria API key</CardTitle>
          <CardDescription>
            Generate an API key to connect your MCP client. Share it only with tools you trust—you
            can revoke it at any time.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {revealedPlanteriaKey ? (
            <Alert>
              <AlertTitle>Copy this key before you leave</AlertTitle>
              <AlertDescription className="text-sm">
                We only show the key once. Store it in a secure location and configure your MCP
                client immediately.
              </AlertDescription>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input value={revealedPlanteriaKey} readOnly className="sm:flex-1" />
                <Button type="button" variant="secondary" onClick={handleCopyPlanteriaKey}>
                  Copy key
                </Button>
              </div>
            </Alert>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={handleGeneratePlanteriaKey}
              disabled={isGeneratingPlanteriaKey || isPlanteriaLoading}
            >
              {planteriaStatus?.hasKey ? "Regenerate key" : "Generate key"}
            </Button>
            {planteriaStatus?.hasKey ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleRevokePlanteriaKey}
                disabled={isRevokingPlanteriaKey}
              >
                {isRevokingPlanteriaKey ? "Revoking..." : "Revoke key"}
              </Button>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-xs text-muted-foreground">{planteriaStatusLine}</span>
        </CardFooter>
      </Card>
    </div>
  );
}
