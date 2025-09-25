import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import type { ZodType } from "zod";

const openAiApiKey = process.env.OPENAI_API_KEY;

if (!openAiApiKey) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const defaultModel = openai("gpt-4o-mini");

type GenerateStructuredInput<T> = {
  schema: ZodType<T>;
  prompt: string;
  system?: string;
  temperature?: number;
};

export async function generateStructuredObject<T>({
  schema,
  prompt,
  system,
  temperature = 0.4,
}: GenerateStructuredInput<T>): Promise<T> {
  const { object } = await generateObject({
    model: defaultModel,
    schema,
    system,
    prompt,
    temperature,
  });

  return object;
}
