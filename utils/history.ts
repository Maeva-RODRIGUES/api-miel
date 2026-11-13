import type { ScanResult } from '@/types/Product';

export interface HistoryEntry extends ScanResult {
  /** Date du scan, en millisecondes (Date.now()). */
  scannedAt: number;
}

export const HISTORY_LIMIT = 50;
export const HISTORY_STORAGE_KEY = 'apimiel:history';

/**
 * Ajoute un scan en tête de l'historique. Un code-barres déjà présent est
 * remplacé (données à jour) plutôt que dupliqué. Fonction pure.
 */
export function addToHistory(
  history: HistoryEntry[],
  scan: ScanResult,
  scannedAt: number,
): HistoryEntry[] {
  const others = history.filter(
    (entry) => entry.product.code !== scan.product.code,
  );
  return [{ ...scan, scannedAt }, ...others].slice(0, HISTORY_LIMIT);
}

/** Relit l'historique sauvegardé ; données absentes ou abîmées → liste vide. */
export function parseHistory(raw: string | null): HistoryEntry[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (entry): entry is HistoryEntry =>
        typeof entry?.scannedAt === 'number' &&
        typeof entry?.product?.code === 'string',
    );
  } catch {
    return [];
  }
}
