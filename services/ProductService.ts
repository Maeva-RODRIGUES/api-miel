import { Product } from '@/types/Product';

export class ProductService {
  private static readonly BASE_URL = 'https://world.openfoodfacts.org/api/v2';

  static async getProduct(barcode: string): Promise<Product | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/product/${barcode}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        return {
          code: data.product.code || barcode,
          product_name: data.product.product_name || data.product.product_name_fr || 'Produit sans nom',
          brands: data.product.brands || '',
          ingredients_text: data.product.ingredients_text || data.product.ingredients_text_fr || '',
          countries: data.product.countries || '',
          origins: data.product.origins || '',
          categories: data.product.categories || '',
          nova_group: data.product.nova_group || null,
          image_url: data.product.image_url || '',
          nutrition_grades: data.product.nutrition_grades || '',
          ecoscore_grade: data.product.ecoscore_grade || '',
          ingredients_analysis_tags: data.product.ingredients_analysis_tags || [],
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      throw error;
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/search?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.products) {
        return data.products.map((product: any) => ({
          code: product.code,
          product_name: product.product_name || product.product_name_fr || 'Produit sans nom',
          brands: product.brands || '',
          ingredients_text: product.ingredients_text || product.ingredients_text_fr || '',
          countries: product.countries || '',
          origins: product.origins || '',
          categories: product.categories || '',
          nova_group: product.nova_group || null,
          image_url: product.image_url || '',
          nutrition_grades: product.nutrition_grades || '',
          ecoscore_grade: product.ecoscore_grade || '',
          ingredients_analysis_tags: product.ingredients_analysis_tags || [],
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la recherche de produits:', error);
      throw error;
    }
  }
}