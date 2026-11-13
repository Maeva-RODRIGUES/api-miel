import type { OriginCategory, Product, ScoreDetails } from '@/types/Product';

// Règles du score : tout est ici pour pouvoir les ajuster facilement.
export const SCORING = {
  base: 60,
  honeyBonus: 30,
  // Ingrédients non renseignés mais produit classé « miel » : la réglementation
  // européenne interdit tout ajout dans un miel, d'où un demi-bonus.
  presumedHoneyBonus: 15,
  syrupPenalty: -50,
  origin: {
    france: 0,
    eu: -5,
    mixed: -15,
    non_eu: -15,
    unknown: -10,
  } satisfies Record<OriginCategory, number>,
  nova: { 3: -10, 4: -25 } as Record<number, number>,
} as const;

const EU_COUNTRIES = new Set([
  'austria',
  'belgium',
  'bulgaria',
  'croatia',
  'cyprus',
  'czech-republic',
  'denmark',
  'estonia',
  'finland',
  'france',
  'germany',
  'greece',
  'hungary',
  'ireland',
  'italy',
  'latvia',
  'lithuania',
  'luxembourg',
  'malta',
  'netherlands',
  'poland',
  'portugal',
  'romania',
  'slovakia',
  'slovenia',
  'spain',
  'sweden',
]);

const HONEY_WORD = /\b(miels?|honey|honig|miele|mel)\b/;
const SYRUP_WORD =
  /\b(sirops?|syrups?|glucose|isoglucose|fructose|sucres?|sugars?|saccharose|sucrose|dextrose|maltodextrines?|invert)\b/;
// Mention légale des mélanges : « originaires et non originaires de l'UE »,
// « originating and non-originating in the EC ».
const MIXED_ORIGIN_TEXT = /non[- ]?originai|non[- ]?originating/;
// Indices dans le texte libre, utilisés seulement en l'absence de tags.
const NON_EU_TEXT =
  /hors (ue|ce)\b|non[- ](ue|ce|eu)\b|non[- ]europe[a-z]*( union)?/g;
const EU_TEXT = /\b(ue|ce|union europeenne|european union)\b/;
const FRANCE_TEXT = /\bfrance\b|\bfrancais/;

/** Minuscules et sans accents : « MIEL de Forêt » → « miel de foret ». */
export function normalize(text: string | null | undefined): string {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Fiche Open Food Facts sans aucune catégorie : on ne peut pas savoir si
 * c'est un miel, ce qui est différent de « ce n'est pas un miel ».
 */
export function hasNoCategory(product: Product): boolean {
  return !product.categories_tags?.length && !normalize(product.categories);
}

export function isHoney(product: Product): boolean {
  if (product.categories_tags?.includes('en:honeys')) return true;
  return HONEY_WORD.test(normalize(product.categories));
}

function analyzeIngredients(text: string) {
  // « sans sucre ajouté » ne doit pas compter comme du sucre.
  const cleaned = normalize(text).replace(
    /(sans|no) (sucres?|sugars?)( ajoutes?| added)?/g,
    '',
  );
  if (!cleaned) {
    return { known: false, hasSyrups: false, onlyHoney: false };
  }
  const hasSyrups = SYRUP_WORD.test(cleaned);
  // Chaque ingrédient (séparé par , ou ;) doit parler de miel.
  // Le contenu entre parenthèses (poids, pourcentages) est ignoré.
  const parts = cleaned
    .replace(/\([^)]*\)/g, '')
    .split(/[,;]/)
    .map((part) => part.replace(/[.\s]+$/, '').trim())
    .filter(Boolean);
  const onlyHoney =
    !hasSyrups &&
    parts.length > 0 &&
    parts.every((part) => HONEY_WORD.test(part));
  return { known: true, hasSyrups, onlyHoney };
}

function classifyOrigin(product: Product): OriginCategory {
  const text = normalize(`${product.origins} ${product.ingredients_text}`);

  // La mention légale de mélange prime : un pot peut être tagué « France »
  // tout en étant un mélange UE / non UE.
  if (MIXED_ORIGIN_TEXT.test(text)) return 'mixed';

  const tags = (product.origins_tags ?? [])
    .filter((tag) => tag.startsWith('en:'))
    .map((tag) => tag.slice(3));

  if (tags.length > 0) {
    if (tags.includes('european-union-and-non-european-union')) return 'mixed';
    const hasEu = tags.some(
      (tag) =>
        EU_COUNTRIES.has(tag) || tag === 'european-union' || tag === 'europe',
    );
    const hasNonEu = tags.some(
      (tag) =>
        !EU_COUNTRIES.has(tag) && tag !== 'european-union' && tag !== 'europe',
    );
    if (hasEu && hasNonEu) return 'mixed';
    if (hasNonEu) return 'non_eu';
    if (tags.every((tag) => tag === 'france')) return 'france';
    return 'eu';
  }

  // Pas de tags : on se rabat sur le texte libre. On retire d'abord les
  // mentions « hors UE » pour ne pas les confondre avec « UE ».
  const hasNonEu = text.search(NON_EU_TEXT) !== -1;
  const euText = text.replace(NON_EU_TEXT, '');
  const hasFrance = FRANCE_TEXT.test(euText);
  const hasEu = hasFrance || EU_TEXT.test(euText);
  if (hasEu && hasNonEu) return 'mixed';
  if (hasNonEu) return 'non_eu';
  if (hasFrance) return 'france';
  if (hasEu) return 'eu';
  return 'unknown';
}

/**
 * Calcule le score d'un miel. Fonction pure : pas de réseau, pas d'état.
 * Retourne null si le produit ne semble pas être un miel.
 */
export function computeScore(product: Product): ScoreDetails | null {
  if (!isHoney(product)) return null;

  const ingredients = analyzeIngredients(product.ingredients_text);
  const origin = classifyOrigin(product);
  const novaGroup = product.nova_group ?? null;

  const honeyBonus = ingredients.onlyHoney
    ? SCORING.honeyBonus
    : !ingredients.known
      ? SCORING.presumedHoneyBonus
      : 0;
  const syrupPenalty = ingredients.hasSyrups ? SCORING.syrupPenalty : 0;
  const originPenalty = SCORING.origin[origin];
  const novaPenalty = novaGroup ? (SCORING.nova[novaGroup] ?? 0) : 0;

  const raw =
    SCORING.base + honeyBonus + syrupPenalty + originPenalty + novaPenalty;

  return {
    score: Math.max(0, Math.min(100, raw)),
    hasOnlyHoney: ingredients.onlyHoney,
    hasSyrups: ingredients.hasSyrups,
    isFromFrance: origin === 'france',
    novaGroup,
    ingredientsKnown: ingredients.known,
    origin,
    details: {
      baseScore: SCORING.base,
      honeyBonus,
      syrupPenalty,
      originPenalty,
      novaPenalty,
    },
  };
}

export interface BreakdownLine {
  label: string;
  points: number;
}

const ORIGIN_LABELS: Record<OriginCategory, string> = {
  france: 'Origine : France',
  eu: 'Origine : Union européenne',
  mixed: 'Origine : mélange UE / non UE',
  non_eu: 'Origine : hors Union européenne',
  unknown: 'Origine non renseignée',
};

/** Traduit le détail du score en lignes lisibles pour l'écran Résultats. */
export function scoreBreakdown(result: ScoreDetails): BreakdownLine[] {
  const { details } = result;
  const honeyLabel = result.hasOnlyHoney
    ? 'Ingrédients : 100 % miel'
    : !result.ingredientsKnown
      ? 'Miel présumé pur (ingrédients non renseignés)'
      : 'Ingrédients autres que du miel';

  return [
    { label: 'Score de base', points: details.baseScore },
    { label: honeyLabel, points: details.honeyBonus },
    {
      label: result.hasSyrups
        ? 'Sirop ou sucre ajouté détecté'
        : 'Aucun sirop ni sucre ajouté',
      points: details.syrupPenalty,
    },
    { label: ORIGIN_LABELS[result.origin], points: details.originPenalty },
    {
      label: result.novaGroup
        ? `Transformation : NOVA ${result.novaGroup}`
        : 'Transformation (NOVA) non renseignée',
      points: details.novaPenalty,
    },
  ];
}
