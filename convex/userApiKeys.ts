import { v } from "convex/values";

import {
  internalQuery,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { decryptSecret, encryptSecret } from "./lib/secretVault";

const PROVIDERS = {
  OPENAI: "openai",
  PLANTERIA: "planteria",
} as const;

type Provider = (typeof PROVIDERS)[keyof typeof PROVIDERS];

const API_KEY_PATTERN = /^sk-[A-Za-z0-9_-]{21,}$/;

function validateApiKey(value: string) {
  const trimmed = value.trim();

  if (!API_KEY_PATTERN.test(trimmed)) {
    throw new Error(
      "OpenAI API key must start with sk- and be at least 24 characters",
    );
  }

  return trimmed;
}

type DbCtx = Pick<MutationCtx, "db"> | Pick<QueryCtx, "db">;

async function findKeyDoc(ctx: DbCtx, userId: string, provider: Provider) {
  const existing = await ctx.db
    .query("user_api_keys")
    .withIndex("by_user_provider", (q) =>
      q.eq("userId", userId).eq("provider", provider),
    )
    .first();

  return existing ?? null;
}

function requireCrypto(): Crypto {
  const crypto = globalThis.crypto;

  if (!crypto) {
    throw new Error("Web Crypto API is not available");
  }

  return crypto;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function hashWithSalt(value: string, salt: string) {
  const crypto = requireCrypto();
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return bytesToBase64(new Uint8Array(digest));
}

function generateSalt() {
  const crypto = requireCrypto();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return bytesToBase64(bytes);
}

function generatePlanteriaKey() {
  const crypto = requireCrypto();
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const keyBody = bytesToBase64Url(bytes);
  return `plnt_${keyBody.slice(0, 43)}`;
}

export const saveOpenAIKey = mutation({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const sanitizedKey = validateApiKey(args.apiKey);
    const encrypted = encryptSecret(sanitizedKey);
    const now = Date.now();
    const lastFour = sanitizedKey.slice(-4);

    const existing = await findKeyDoc(ctx, identity.subject, PROVIDERS.OPENAI);

    if (existing) {
      await ctx.db.patch(existing._id, {
        ciphertext: encrypted.ciphertext,
        lastFour,
        updatedAt: now,
      });

      return { lastFour };
    }

    await ctx.db.insert("user_api_keys", {
      userId: identity.subject,
      provider: PROVIDERS.OPENAI,
      ciphertext: encrypted.ciphertext,
      lastFour,
      createdAt: now,
      updatedAt: now,
    });

    return { lastFour };
  },
});

export const deleteOpenAIKey = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const existing = await findKeyDoc(ctx, identity.subject, PROVIDERS.OPENAI);

    if (!existing) {
      return { status: "missing" as const };
    }

    await ctx.db.delete(existing._id);

    return { status: "deleted" as const };
  },
});

export const getOpenAIKeyStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const existing = await findKeyDoc(ctx, identity.subject, PROVIDERS.OPENAI);

    if (!existing) {
      return {
        hasKey: false,
      } as const;
    }

    return {
      hasKey: true,
      lastFour: existing.lastFour,
      updatedAt: existing.updatedAt,
    } as const;
  },
});

export const getOpenAIKey = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await findKeyDoc(ctx, args.userId, PROVIDERS.OPENAI);

    if (!existing) {
      return null;
    }

    if (!existing.ciphertext) {
      throw new Error("OpenAI key is missing ciphertext");
    }

    const apiKey = decryptSecret({ ciphertext: existing.ciphertext });

    return {
      provider: existing.provider,
      apiKey,
      lastFour: existing.lastFour,
    } as const;
  },
});

export const generatePlanteriaApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const apiKey = generatePlanteriaKey();
    const salt = generateSalt();
    const hash = await hashWithSalt(apiKey, salt);
    const now = Date.now();
    const lastFour = apiKey.slice(-4);

    const existing = await findKeyDoc(
      ctx,
      identity.subject,
      PROVIDERS.PLANTERIA,
    );

    if (existing) {
      await ctx.db.patch(existing._id, {
        hash,
        salt,
        lastFour,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("user_api_keys", {
        userId: identity.subject,
        provider: PROVIDERS.PLANTERIA,
        hash,
        salt,
        lastFour,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      apiKey,
      lastFour,
    } as const;
  },
});

export const deletePlanteriaApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const existing = await findKeyDoc(
      ctx,
      identity.subject,
      PROVIDERS.PLANTERIA,
    );

    if (!existing) {
      return { status: "missing" as const };
    }

    await ctx.db.delete(existing._id);

    return { status: "deleted" as const };
  },
});

export const getPlanteriaApiKeyStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const existing = await findKeyDoc(
      ctx,
      identity.subject,
      PROVIDERS.PLANTERIA,
    );

    if (!existing) {
      return { hasKey: false } as const;
    }

    return {
      hasKey: Boolean(existing.hash && existing.salt),
      lastFour: existing.lastFour,
      updatedAt: existing.updatedAt,
    } as const;
  },
});

export const getPlanteriaApiKeyMetadata = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await findKeyDoc(ctx, args.userId, PROVIDERS.PLANTERIA);

    if (!existing || !existing.hash || !existing.salt) {
      return null;
    }

    return {
      hash: existing.hash,
      salt: existing.salt,
      lastFour: existing.lastFour,
    } as const;
  },
});
