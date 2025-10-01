const SUBSTANTIVE_WORD_REGEX = /[a-zA-Z]{3,}/;
const URL_REGEX = /(https?:\/\/|www\.)/i;

export const IDEA_MIN_LENGTH = 20;
export const IDEA_MAX_LENGTH = 240;
export const IDEA_MIN_WORD_COUNT = 5;
export const IDEA_MIN_SUBSTANTIVE_WORDS = 3;

export type IdeaMetrics = {
  trimmed: string;
  length: number;
  wordCount: number;
  substantiveWordCount: number;
  hasUrl: boolean;
};

export function getIdeaMetrics(input: string): IdeaMetrics {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      trimmed,
      length: 0,
      wordCount: 0,
      substantiveWordCount: 0,
      hasUrl: false,
    };
  }

  const words = trimmed.split(/\s+/);
  const substantiveWordCount = words.filter((word) => SUBSTANTIVE_WORD_REGEX.test(word)).length;

  return {
    trimmed,
    length: trimmed.length,
    wordCount: words.length,
    substantiveWordCount,
    hasUrl: URL_REGEX.test(trimmed),
  };
}

export function validateIdea(input: string): string | null {
  const metrics = getIdeaMetrics(input);

  if (!metrics.trimmed) {
    return "Describe your build mission so we know where to aim.";
  }

  if (metrics.length < IDEA_MIN_LENGTH) {
    return `Give a little more detail (${IDEA_MIN_LENGTH} characters minimum).`;
  }

  if (metrics.length > IDEA_MAX_LENGTH) {
    return `Shorten the idea to under ${IDEA_MAX_LENGTH} characters so we stay focused.`;
  }

  if (metrics.hasUrl) {
    return "Skip raw URLs—summarize what you want to build instead.";
  }

  if (metrics.wordCount < IDEA_MIN_WORD_COUNT) {
    return "Spell out the mission in a short sentence or two (at least 5 words).";
  }

  if (metrics.substantiveWordCount < IDEA_MIN_SUBSTANTIVE_WORDS) {
    return "Add a few concrete words so we grasp the scope.";
  }

  return null;
}
