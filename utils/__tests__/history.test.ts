import { describe, expect, it } from '@jest/globals';
import type { Product, ScanResult } from '@/types/Product';
import { HISTORY_LIMIT, addToHistory, parseHistory } from '@/utils/history';

function scan(code: string, name = `Produit ${code}`): ScanResult {
  const product: Product = {
    code,
    product_name: name,
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
  };
  return { product, score: null };
}

describe('addToHistory', () => {
  it('ajoute le scan en tête avec sa date', () => {
    const history = addToHistory([], scan('1'), 1000);
    expect(history).toEqual([{ ...scan('1'), scannedAt: 1000 }]);
  });

  it('place le scan le plus récent en premier', () => {
    let history = addToHistory([], scan('1'), 1000);
    history = addToHistory(history, scan('2'), 2000);
    expect(history.map((e) => e.product.code)).toEqual(['2', '1']);
  });

  it('remplace un code-barres déjà présent et le remonte en tête', () => {
    let history = addToHistory([], scan('1', 'Ancien nom'), 1000);
    history = addToHistory(history, scan('2'), 2000);
    history = addToHistory(history, scan('1', 'Nouveau nom'), 3000);
    expect(history).toHaveLength(2);
    expect(history[0].product.product_name).toBe('Nouveau nom');
    expect(history[0].scannedAt).toBe(3000);
    expect(history[1].product.code).toBe('2');
  });

  it(`garde au plus ${HISTORY_LIMIT} scans`, () => {
    let history = addToHistory([], scan('0'), 0);
    for (let i = 1; i <= HISTORY_LIMIT; i++) {
      history = addToHistory(history, scan(String(i)), i);
    }
    expect(history).toHaveLength(HISTORY_LIMIT);
    expect(history[0].product.code).toBe(String(HISTORY_LIMIT));
    // Le plus ancien (code 0) est sorti.
    expect(history.some((e) => e.product.code === '0')).toBe(false);
  });

  it('ne modifie pas la liste reçue', () => {
    const original = addToHistory([], scan('1'), 1000);
    addToHistory(original, scan('2'), 2000);
    expect(original).toHaveLength(1);
  });
});

describe('parseHistory', () => {
  it('relit un historique sauvegardé', () => {
    const history = addToHistory([], scan('1'), 1000);
    expect(parseHistory(JSON.stringify(history))).toEqual(history);
  });

  it('renvoie une liste vide si rien n’est sauvegardé ou si les données sont abîmées', () => {
    expect(parseHistory(null)).toEqual([]);
    expect(parseHistory('pas du json')).toEqual([]);
    expect(parseHistory('{"a":1}')).toEqual([]);
    expect(parseHistory('[{"foo":1}]')).toEqual([]);
  });
});
