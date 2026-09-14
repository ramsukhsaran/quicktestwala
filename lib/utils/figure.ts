/**
 * Utility functions for handling figures/diagrams in questions across
 * CSV uploads, JSON bulk imports, and CBT display.
 */

export function extractQuestionFigureUrl(row: Record<string, any>): string | undefined {
  if (!row) return undefined;

  // 1. Direct dedicated column checks (case-insensitive keys handled via normalization)
  const candidateKeys = [
    "image_url",
    "figure_url",
    "imageurl",
    "figure",
    "diagram",
    "diagram_url",
    "imageUrl",
    "image",
  ];

  for (const key of candidateKeys) {
    const val = row[key];
    if (typeof val === "string" && val.trim().length > 0) {
      return val.trim();
    }
  }

  // 2. Check inline markdown image syntax in question: ![alt](url)
  const questionText = row.question || row.questionText;
  if (typeof questionText === "string" && questionText.trim().length > 0) {
    const mdMatch = questionText.match(
      /!\[.*?\]\(((?:https?:\/\/|\/|data:image\/)[^\s\)]+)\)/i
    );
    if (mdMatch && mdMatch[1]) {
      return mdMatch[1].trim();
    }

    // Check HTML <img ... src="..." />
    const imgMatch = questionText.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1].trim();
    }
  }

  return undefined;
}

/**
 * If the question text contains inline markdown image syntax that was extracted into
 * an imageUrl, this helper can strip the raw syntax so it doesn't display raw markdown code.
 */
export function cleanQuestionTextWithFigure(text: string): string {
  if (!text) return "";
  return text
    .replace(/!\[.*?\]\(((?:https?:\/\/|\/|data:image\/)[^\s\)]+)\)/gi, "")
    .replace(/<img[^>]+src=["'][^"']+["'][^>]*>/gi, "")
    .trim();
}
