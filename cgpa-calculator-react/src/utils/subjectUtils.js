/**
 * Logic to detect if a subject is "Blended" based on its course code.
 * Pattern: [Regulation][Dept][Semester][Type][Serial]
 * Example: 21IT321 -> Type '2' indicates Blended.
 */
export const isBlendedSubject = (label) => {
    if (!label) return false;

    // Extract code inside parentheses at the end: e.g. "Discrete Mathematics (21MA305)" -> "21MA305"
    const codeMatch = label.match(/\(([^)]+)\)$/);
    if (!codeMatch) return false;
    const code = codeMatch[1];

    // Revised logic: Pattern is [Regulation][Dept][Numbers]
    // Example: 21IT321 or 21MAT321
    // Find the department letters and the following numbers
    const match = code.match(/([A-Z]+)(\d+)/i);
    if (match) {
        const dept = match[1];
        const numbers = match[2];

        // If department code has 3 characters, it's not blended
        if (dept.length === 3) return false;

        // Otherwise, use the existing logic check for second digit of numeric part
        // Note: For codes like 21IT321, numbers is "321". The second digit is at index 1.
        if (numbers.length >= 2) {
            return numbers[1] === '2';
        }
    }
    return false;
};
