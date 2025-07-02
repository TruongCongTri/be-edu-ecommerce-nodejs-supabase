import { FORBIDDEN_WORDS } from "../constants/enum";
import { AppError } from "../utils/errors/AppError";
/**
 * Checks if any of the provided texts contain forbidden words.
 * Throws an AppError if a forbidden word is found.
 *
 * @param texts - An array of strings to check for forbidden words.
 * @param entityName - The name of the entity being checked (e.g., "Job", "Category") for clearer error messages.
 */
export function checkForbiddenWords(texts: string[], entityName: string): void {
  for (const text of texts) {
    if (!text) continue; // Skip if text is null, undefined, or empty

    const lowerCaseText = text.toLowerCase();
    for (const word of FORBIDDEN_WORDS) {
      if (lowerCaseText.includes(word)) {
        throw new AppError(`${entityName} content contains forbidden word: '${word}'`, 400);
      }
    }
  }
}
