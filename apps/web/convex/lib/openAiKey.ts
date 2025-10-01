export type OpenAiKeySource = "user" | "default";

export type ResolvedOpenAiKey = {
  apiKey: string;
  source: OpenAiKeySource;
  lastFour: string;
};

function sanitize(value: string | undefined | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function resolveOpenAiKey(
  userKey: { apiKey: string; lastFour?: string } | null | undefined,
): ResolvedOpenAiKey | null {
  const sanitizedUserKey = sanitize(userKey?.apiKey);

  if (sanitizedUserKey) {
    return {
      apiKey: sanitizedUserKey,
      source: "user",
      lastFour: userKey?.lastFour ?? sanitizedUserKey.slice(-4),
    } satisfies ResolvedOpenAiKey;
  }

  const defaultKey = sanitize(process.env.OPENAI_API_KEY ?? null);

  if (defaultKey) {
    return {
      apiKey: defaultKey,
      source: "default",
      lastFour: defaultKey.slice(-4),
    } satisfies ResolvedOpenAiKey;
  }

  return null;
}

export function isDefaultOpenAiKeyAvailable() {
  return Boolean(sanitize(process.env.OPENAI_API_KEY ?? null));
}
