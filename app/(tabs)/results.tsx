import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Scan, Info, ExternalLink, Star } from 'lucide-react-native';
import { HoneyDropAnimation } from '@/components/HoneyDropAnimation';
import { useScan } from '@/context/ScanContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hasNoCategory, scoreBreakdown, verdict } from '@/utils/scoring';

function formatPoints(points: number) {
  return points > 0 ? `+${points}` : `${points}`;
}

function ScanAnotherButton() {
  return (
    <TouchableOpacity
      style={styles.scanButton}
      onPress={() => router.navigate('/scan')}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#FFD700', '#B8860B']}
        style={styles.scanButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Scan size={24} color="white" strokeWidth={3} />
        <Text style={styles.scanButtonText}>Scanner un autre pot</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function ResultsScreen() {
  const { lastScan, history, toggleFavorite } = useScan();
  const insets = useSafeAreaInsets();
  const isFavorite = !!history.find(
    (entry) => entry.product.code === lastScan?.product.code,
  )?.favorite;

  return (
    <LinearGradient
      colors={['#FFF8E1', '#F4E6D1', '#E6D3A3']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!lastScan ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍯</Text>
            <Text style={styles.title}>Aucun scan pour l'instant</Text>
            <Text style={styles.subtitle}>
              Scannez un pot de miel pour découvrir son score ApiMiel.
            </Text>
          </View>
        ) : (
          <>
            {/* Produit */}
            <View style={styles.productCard}>
              {lastScan.product.image_url ? (
                <Image
                  source={{ uri: lastScan.product.image_url }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.productImage, styles.imagePlaceholder]}>
                  <Text style={styles.emptyEmoji}>🍯</Text>
                </View>
              )}
              <Text style={styles.productName}>
                {lastScan.product.product_name}
              </Text>
              {!!lastScan.product.brands && (
                <Text style={styles.productBrand}>
                  {lastScan.product.brands}
                </Text>
              )}
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(lastScan.product.code)}
                activeOpacity={0.8}
              >
                <Star
                  size={18}
                  color="#B8860B"
                  fill={isFavorite ? '#FFD700' : 'transparent'}
                />
                <Text style={styles.favoriteText}>
                  {isFavorite ? 'Dans vos favoris' : 'Ajouter aux favoris'}
                </Text>
              </TouchableOpacity>
            </View>

            {lastScan.score ? (
              <>
                {/* Score : la key relance l'animation à chaque nouveau produit */}
                <View style={styles.scoreCard}>
                  <HoneyDropAnimation
                    key={lastScan.product.code}
                    score={lastScan.score.score}
                  />
                  <Text
                    style={[
                      styles.scoreValue,
                      { color: verdict(lastScan.score.score).color },
                    ]}
                  >
                    {lastScan.score.score}
                    <Text style={styles.scoreMax}>/100</Text>
                  </Text>
                  <Text
                    style={[
                      styles.verdict,
                      { color: verdict(lastScan.score.score).color },
                    ]}
                  >
                    {verdict(lastScan.score.score).label}
                  </Text>
                </View>

                {/* Détail des bonus et pénalités */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailTitle}>Détail du score</Text>
                  {scoreBreakdown(lastScan.score).map((line) => (
                    <View key={line.label} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{line.label}</Text>
                      <Text
                        style={[
                          styles.detailPoints,
                          line.points < 0 && styles.negative,
                          line.points > 0 && styles.positive,
                        ]}
                      >
                        {formatPoints(line.points)}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : hasNoCategory(lastScan.product) ? (
              <View style={styles.detailCard}>
                <Text style={styles.title}>
                  Fiche Open Food Facts incomplète
                </Text>
                <Text style={styles.subtitle}>
                  Ce produit n'a pas encore de catégorie sur Open Food Facts :
                  impossible de savoir si c'est un miel. Aidez la communauté en
                  complétant sa fiche : nom, catégorie (ex. « Miels de sarrasin
                  »), ingrédients et origine.
                </Text>
                <TouchableOpacity
                  style={styles.offButton}
                  onPress={() =>
                    Linking.openURL(
                      `https://fr.openfoodfacts.org/produit/${lastScan.product.code}`,
                    )
                  }
                  activeOpacity={0.8}
                >
                  <ExternalLink size={18} color="#8B4513" />
                  <Text style={styles.offButtonText}>
                    Compléter la fiche sur Open Food Facts
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.detailCard}>
                <Text style={styles.title}>
                  Ce produit ne semble pas être un miel
                </Text>
                <Text style={styles.subtitle}>
                  Sa catégorie sur Open Food Facts ne correspond pas à un miel,
                  aucun score n'est donc calculé.
                </Text>
              </View>
            )}

            <View style={styles.disclaimer}>
              <Info size={16} color="#A0522D" />
              <Text style={styles.disclaimerText}>
                Score indicatif basé sur les données collaboratives d'Open Food
                Facts.
              </Text>
            </View>
          </>
        )}

        <ScanAnotherButton />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0522D',
    textAlign: 'center',
    lineHeight: 22,
  },
  productCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D4A574',
  },
  favoriteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
  },
  productImage: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B4513',
    textAlign: 'center',
  },
  productBrand: {
    fontSize: 16,
    color: '#A0522D',
    marginTop: 4,
  },
  scoreCard: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 24,
    fontWeight: '600',
    color: '#A0522D',
  },
  verdict: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  detailCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(184,134,11,0.15)',
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    color: '#5C3A1E',
    marginRight: 10,
  },
  detailPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A0522D',
  },
  positive: {
    color: '#2E7D32',
  },
  negative: {
    color: '#D9472B',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#A0522D',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  offButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#B8860B',
  },
  offButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B4513',
  },
  scanButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
