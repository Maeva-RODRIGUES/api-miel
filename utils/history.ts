import type { ScanResult } from '@/types/Product';

export interface HistoryEntry extends ScanResult {
  /** Date du scan, en millisecondes (Date.now()). */
  scannedAt: number;
  favorite?: boolean;
}

export const HISTORY_LIMIT = 50;
export const HISTORY_STORAGE_KEY = 'apimiel:history';

/**
 * Ajoute un scan en tête de l'historique. Un code-barres déjà présent est
 * remplacé (données à jour, étoile conservée) plutôt que dupliqué.
 * Au-delà de la limite, les plus anciens non favoris sortent en premier :
 * un favori n'est jamais perdu. Fonction pure.
 */
export function addToHistory(
  history: HistoryEntry[],
  scan: ScanResult,
  scannedAt: number,
): HistoryEntry[] {
  const previous = history.find(
    (entry) => entry.product.code === scan.product.code,
  );
  const next: HistoryEntry[] = [
    { ...scan, scannedAt, favorite: previous?.favorite },
    ...history.filter((entry) => entry !== previous),
  ];

  // La liste est triée du plus récent au plus ancien : on retire depuis la fin.
  for (let i = next.length - 1; next.length > HISTORY_LIMIT && i > 0; i--) {
    if (!next[i].favorite) next.splice(i, 1);
  }
  return next;
}

/** Ajoute ou retire l'étoile d'un pot. Fonction pure. */
export function toggleFavorite(
  history: HistoryEntry[],
  code: string,
): HistoryEntry[] {
  return history.map((entry) =>
    entry.product.code === code
      ? { ...entry, favorite: !entry.favorite }
      : entry,
  );
}

/** « Effacer l'historique » : seuls les favoris restent. */
export function clearHistoryKeepingFavorites(
  history: HistoryEntry[],
): HistoryEntry[] {
  return history.filter((entry) => entry.favorite);
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
