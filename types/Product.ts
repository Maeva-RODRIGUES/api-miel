export interface Product {
  code: string;
  product_name: string;
  brands: string;
  ingredients_text: string;
  countries: string;
  origins: string;
  categories: string;
  nova_group?: number | null;
  image_url: string;
  nutrition_grades: string;
  ecoscore_grade: string;
  ingredients_analysis_tags: string[];
}

export interface ScanResult {
  product: Product;
  score: number;
  analysis: {
    hasOnlyHoney: boolean;
    hasSyrups: boolean;
    isFromFrance: boolean;
    novaGroup: number | null;
  };
}

export interface ScoreDetails {
  score: number;
  hasOnlyHoney: boolean;
  hasSyrups: boolean;
  isFromFrance: boolean;
  novaGroup: number | null;
  details: {
    baseScore: number;
    honeyBonus: number;
    syrupPenalty: number;
    originPenalty: number;
    novaPenalty: number;
  };
}