import { FORBIDDEN_WORDS } from "../constants/enum";
import { AppError } from "../utils/errors/AppError";
/**
 * Checks if any of the provided texts contain forbidden words.
 * Throws an AppError if a forbidden word is found.
 *
 * @param texts - An array of strings to check for forbidden words.
 * @param entityName - The name of the entity being checked (e.g., "Job", "Category") for clearer error messages.
 */
export function checkForbiddenWords(
  fields: Record<string, string | undefined>,
  entityName: string
): void {
  const violations: string[] = [];

  for (const [fieldName, text] of Object.entries(fields)) {
    if (!text) continue;

    const lowerCaseText = text.toLowerCase();
    for (const word of FORBIDDEN_WORDS) {
      if (lowerCaseText.includes(word)) {
        violations.push(`${fieldName}: '${word}'`);
      }
    }
  }

  if (violations.length > 0) {
    throw new AppError(
      `${entityName} contains forbidden words → ${violations.join("; ")}`,
      400
    );
  }
}
