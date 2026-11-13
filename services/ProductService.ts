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
          categories_tags: data.product.categories_tags || [],
          origins_tags: data.product.origins_tags || [],
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
}
