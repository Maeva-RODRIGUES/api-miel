import { describe, expect, it } from '@jest/globals';
import { Product } from '@/types/Product';
import {
  computeScore,
  hasNoCategory,
  normalize,
  scoreBreakdown,
} from '@/utils/scoring';

// Construit un produit avec des valeurs neutres, à surcharger par test.
function product(overrides: Partial<Product>): Product {
  return {
    code: '0',
    product_name: '',
    brands: '',
    ingredients_text: '',
    countries: '',
    origins: '',
    categories: '',
    categories_tags: [],
    origins_tags: [],
    nova_group: null,
    image_url: '',
    nutrition_grades: '',
    ecoscore_grade: '',
    ingredients_analysis_tags: [],
    ...overrides,
  };
}

// Données réelles d'Open Food Facts (simplifiées), avec leur code-barres.
const mielDeFrance = product({
  code: '3088541002476',
  ingredients_text: 'Miel de Fleurs',
  categories: 'Miels',
  categories_tags: ['en:honeys'],
  origins: 'France',
  origins_tags: ['en:france'],
  nova_group: 2,
});

const melangeUe = product({
  code: '3088540004440',
  ingredients_text: "Mélange de miels non originaires et originaires de l'UE.",
  categories_tags: ['en:honeys'],
  origins_tags: [
    'en:france',
    'en:spain',
    'en:argentina',
    'en:european-union-and-non-european-union',
  ],
  nova_group: 2,
});

const fauxMielAuSirop = product({
  code: '7503006359033',
  ingredients_text: 'honey bee, corn syrup',
  categories: 'Corn syrups, zh:Honey bee',
  categories_tags: ['en:syrups', 'en:corn-syrups', 'zh:Honey bee'],
  origins_tags: ['en:mexico'],
  nova_group: 1,
});

const nutella = product({
  code: '3017620422003',
  ingredients_text: 'sugar, palm oil',
  categories: 'Pâtes à tartiner',
  categories_tags: ['en:spreads', 'en:hazelnut-spreads'],
  nova_group: 3,
});

const mielSansIngredients = product({
  code: '3088541002469',
  categories_tags: ['en:honeys'],
  origins_tags: ['en:france'],
  nova_group: 2,
});

describe('normalize', () => {
  it('passe en minuscules et retire les accents', () => {
    expect(normalize('MIEL de Forêt Récolté')).toBe('miel de foret recolte');
  });
});

describe('computeScore', () => {
  it('donne 90 à un miel français pur', () => {
    const result = computeScore(mielDeFrance)!;
    expect(result.score).toBe(90);
    expect(result.hasOnlyHoney).toBe(true);
    expect(result.origin).toBe('france');
  });

  it('pénalise un mélange UE / non UE', () => {
    const result = computeScore(melangeUe)!;
    expect(result.origin).toBe('mixed');
    expect(result.details.originPenalty).toBe(-15);
    expect(result.score).toBe(75);
  });

  it('détecte le mélange dans le texte même si les tags disent France', () => {
    const result = computeScore(
      product({
        code: '3088545004018',
        ingredients_text:
          "Mélange de miels d'acacia originaires et non originaires de la Ce.",
        categories_tags: ['en:honeys'],
        origins_tags: ['en:france', 'en:europe'],
      }),
    )!;
    expect(result.origin).toBe('mixed');
  });

  it("borne à 0 un faux miel au sirop d'origine hors UE", () => {
    const result = computeScore(fauxMielAuSirop)!;
    expect(result.hasSyrups).toBe(true);
    expect(result.hasOnlyHoney).toBe(false);
    expect(result.origin).toBe('non_eu');
    expect(result.score).toBe(0);
  });

  it("refuse un produit qui n'est pas un miel", () => {
    expect(computeScore(nutella)).toBeNull();
  });

  it('accorde un demi-bonus quand les ingrédients ne sont pas renseignés', () => {
    const result = computeScore(mielSansIngredients)!;
    expect(result.ingredientsKnown).toBe(false);
    expect(result.details.honeyBonus).toBe(15);
    expect(result.score).toBe(75);
  });

  it('ne confond pas « sans sucre ajouté » avec du sucre', () => {
    const result = computeScore(
      product({
        ingredients_text: 'Miel (sans sucre ajouté)',
        categories_tags: ['en:honeys'],
        origins_tags: ['en:france'],
      }),
    )!;
    expect(result.hasSyrups).toBe(false);
    expect(result.hasOnlyHoney).toBe(true);
  });

  it('met une origine inconnue à -10', () => {
    const result = computeScore(
      product({ ingredients_text: 'Miel', categories_tags: ['en:honeys'] }),
    )!;
    expect(result.origin).toBe('unknown');
    expect(result.details.originPenalty).toBe(-10);
  });
  it('classe « Non European Union » seul en hors UE, pas en mélange', () => {
    const result = computeScore(
      product({
        code: '5052909732600',
        ingredients_text: 'Honey',
        categories_tags: ['en:honeys'],
        origins: 'Non European Union',
        origins_tags: ['en:non-european-union'],
      }),
    )!;
    expect(result.origin).toBe('non_eu');
  });

  it("lit l'origine dans le texte quand il n'y a pas de tags", () => {
    const base = { ingredients_text: 'Miel', categories_tags: ['en:honeys'] };
    expect(computeScore(product({ ...base, origins: 'Hors UE' }))!.origin).toBe(
      'non_eu',
    );
    expect(
      computeScore(product({ ...base, origins: 'UE et hors UE' }))!.origin,
    ).toBe('mixed');
    expect(
      computeScore(product({ ...base, origins: 'Récolté en France' }))!.origin,
    ).toBe('france');
  });
});

describe('scoreBreakdown', () => {
  it('liste les lignes du score, dont la somme redonne le score', () => {
    const result = computeScore(mielSansIngredients)!;
    const lines = scoreBreakdown(result);
    expect(lines.map((line) => line.label)).toContain(
      'Miel présumé pur (ingrédients non renseignés)',
    );
    expect(lines.reduce((sum, line) => sum + line.points, 0)).toBe(
      result.score,
    );
  });
});

describe('hasNoCategory', () => {
  // Fiche réelle 3335440125004 (miel de sarrasin) : seule la photo est saisie.
  it('détecte une fiche sans catégorie', () => {
    expect(hasNoCategory(product({ code: '3335440125004' }))).toBe(true);
  });

  it('ne signale pas une fiche catégorisée', () => {
    expect(hasNoCategory(mielDeFrance)).toBe(false);
    expect(hasNoCategory(product({ categories: 'Sirops' }))).toBe(false);
  });
});
