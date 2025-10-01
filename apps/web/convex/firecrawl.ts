"use node";

import Firecrawl from "@mendable/firecrawl-js";
import { v } from "convex/values";
import { action } from "./_generated/server";
import type { ResearchInsight } from "./lib/prompts";

const DEFAULT_RESULT_LIMIT = 3;
const MAX_SNIPPET_LENGTH = 900;
const MAX_DESCRIPTION_LENGTH = 260;

export const searchAndScrape = action({
  args: {
    idea: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, { idea, limit }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey) throw new Error("Missing FIRECRAWL_API_KEY");

    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

    const results = await firecrawl.search(idea, {
      limit: limit ?? DEFAULT_RESULT_LIMIT,
      scrapeOptions: { formats: ["markdown"] },
    });

    if (!results) throw new Error("Failed to search and scrape");

    const insights = mapToInsights(results?.web, limit ?? DEFAULT_RESULT_LIMIT);

    return { insights } satisfies { insights: ResearchInsight[] };
  },
});

function mapToInsights(rawResults: unknown, limit: number): ResearchInsight[] {
  if (!Array.isArray(rawResults)) {
    return [];
  }

  const uniqueUrls = new Set<string>();
  const cappedLimit = limit > 0 ? Math.min(limit, 6) : DEFAULT_RESULT_LIMIT;
  const insights: ResearchInsight[] = [];

  for (const result of rawResults) {
    if (insights.length >= cappedLimit) break;
    if (!result || typeof result !== "object") continue;

    const maybeUrl = extractUrl(result);

    if (!maybeUrl || uniqueUrls.has(maybeUrl)) continue;

    const title = extractTitle(result) ?? maybeUrl;
    const snippet = buildSnippet(result);

    if (!snippet) continue;

    uniqueUrls.add(maybeUrl);
    insights.push({ title, url: maybeUrl, snippet });
  }

  return insights;
}

function extractUrl(result: Record<string, unknown>): string | null {
  const directUrl = typeof result.url === "string" ? result.url : null;
  if (directUrl) return directUrl;

  const metadata = result.metadata;
  if (metadata && typeof metadata === "object") {
    const { sourceURL, url } = metadata as { sourceURL?: unknown; url?: unknown };
    if (typeof sourceURL === "string") return sourceURL;
    if (typeof url === "string") return url;
  }

  return null;
}

function extractTitle(result: Record<string, unknown>): string | null {
  const directTitle = typeof result.title === "string" ? result.title : null;
  if (directTitle && directTitle.trim()) return directTitle.trim();

  const metadata = result.metadata;
  if (metadata && typeof metadata === "object") {
    const { title, ogTitle } = metadata as { title?: unknown; ogTitle?: unknown };
    if (typeof title === "string" && title.trim()) return title.trim();
    if (typeof ogTitle === "string" && ogTitle.trim()) return ogTitle.trim();
  }

  return null;
}

function buildSnippet(result: Record<string, unknown>): string | null {
  const description = normalizeText(result.description, MAX_DESCRIPTION_LENGTH);
  const markdownContent = normalizeText(result.markdown, MAX_SNIPPET_LENGTH);

  if (!description && !markdownContent) {
    const maybeMetadata = result.metadata;
    if (maybeMetadata && typeof maybeMetadata === "object") {
      const metadataDescription = normalizeText(
        (maybeMetadata as { description?: unknown }).description,
        MAX_DESCRIPTION_LENGTH,
      );

      if (metadataDescription) {
        return metadataDescription;
      }
    }

    return null;
  }

  const combined = [description, markdownContent].filter(Boolean).join("\n\n");

  return combined.slice(0, MAX_SNIPPET_LENGTH).trim() || null;
}

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("http"))
    .join(" \n ");

  if (!cleaned) {
    return null;
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}
