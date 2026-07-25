/**
 * Utility to map batch year to regulation
 * Rule: Batches starting 2025-2028 → 25regulation
 *       Batches starting 2029-2032 → 29regulation
 *       etc.
 */

export function getRegulationForBatch(batchString) {
    if (!batchString) return null;

    // Extract start year from batch string (e.g., "2025-2029" → 2025)
    const startYear = parseInt(batchString.split('-')[0]);

    if (isNaN(startYear)) return null;

    // Determine regulation based on start year
    if (startYear >= 2025 && startYear <= 2028) {
        return 25; // 25regulation
    } else if (startYear >= 2029 && startYear <= 2032) {
        return 29; // 29regulation
    } else if (startYear >= 2033 && startYear <= 2036) {
        return 33; // 33regulation
    } else {
        // Default to 21regulation for older batches
        return 21;
    }
}

export function getRegulationDisplayName(regulationYear) {
    if (!regulationYear) return null;
    return `${regulationYear}regulation`;
}

export function getRegulationFullName(regulationYear) {
    if (!regulationYear) return null;
    // Convert 21 → 2021, 25 → 2025
    const fullYear = regulationYear < 100 ? 2000 + regulationYear : regulationYear;
    return `${fullYear} Regulation`;
}
