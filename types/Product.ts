export interface Product {
  code: string;
  product_name: string;
  brands: string;
  ingredients_text: string;
  countries: string;
  origins: string;
  categories: string;
  // Tags normalisés par Open Food Facts (ex. "en:honeys", "en:france") :
  // plus fiables que les champs texte saisis par les bénévoles.
  categories_tags?: string[];
  origins_tags?: string[];
  nova_group?: number | null;
  image_url: string;
  nutrition_grades: string;
  ecoscore_grade: string;
  ingredients_analysis_tags: string[];
}

export interface ScanResult {
  product: Product;
  // null quand le produit ne semble pas être un miel.
  score: ScoreDetails | null;
}

export type OriginCategory = 'france' | 'eu' | 'mixed' | 'non_eu' | 'unknown';

export interface ScoreDetails {
  score: number;
  hasOnlyHoney: boolean;
  hasSyrups: boolean;
  isFromFrance: boolean;
  novaGroup: number | null;
  ingredientsKnown: boolean;
  origin: OriginCategory;
  details: {
    baseScore: number;
    honeyBonus: number;
    syrupPenalty: number;
    originPenalty: number;
    novaPenalty: number;
  };
}
