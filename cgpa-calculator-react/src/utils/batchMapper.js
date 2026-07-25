/**
 * Map batch year to regulation
 * Based on user's specified rules:
 * - Batches starting 2025-2028 → 25regulation
 * - Batches starting 2029-2032 → 29regulation
 */

export const DEFAULT_BATCHES = ['2023-2027', '2024-2028', '2025-2029'];

export const getRegulationForBatch = (batchString) => {
    if (!batchString) return null;

    const startYear = parseInt(batchString.split('-')[0]);

    if (isNaN(startYear)) return null;

    if (startYear >= 2025 && startYear <= 2028) {
        return 25;
    } else if (startYear >= 2029 && startYear <= 2032) {
        return 29;
    } else if (startYear >= 2033 && startYear <= 2036) {
        return 33;
    } else {
        return 21; // Default regulation
    }
};

export const getRegulationDisplayName = (regulationYear) => {
    if (!regulationYear) return null;
    return `${regulationYear}regulation`;
};

export const getRegulationFullName = (regulationYear) => {
    if (!regulationYear) return null;
    const fullYear = regulationYear < 100 ? 2000 + regulationYear : regulationYear;
    return `${fullYear} Regulation`;
};
