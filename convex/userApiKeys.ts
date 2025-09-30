import { v } from "convex/values";

import {
  internalQuery,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { decryptSecret, encryptSecret } from "./lib/secretVault";

const PROVIDER = "openai";

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

async function findKeyDoc(ctx: DbCtx, userId: string) {
  const existing = await ctx.db
    .query("user_api_keys")
    .withIndex("by_user_provider", (q) =>
      q.eq("userId", userId).eq("provider", PROVIDER),
    )
    .first();

  return existing ?? null;
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

    const existing = await findKeyDoc(ctx, identity.subject);

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
      provider: PROVIDER,
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

    const existing = await findKeyDoc(ctx, identity.subject);

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

    const existing = await findKeyDoc(ctx, identity.subject);

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
    const existing = await findKeyDoc(ctx, args.userId);

    if (!existing) {
      return null;
    }

    const apiKey = decryptSecret({
      ciphertext: existing.ciphertext,
    });

    return {
      provider: existing.provider,
      apiKey,
      lastFour: existing.lastFour,
    } as const;
  },
});
