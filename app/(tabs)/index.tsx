import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Scan, Sparkles, Shield, Award } from 'lucide-react-native';
import { HoneyDropAnimation } from '@/components/HoneyDropAnimation';
import { AnimatedBee } from '@/components/AnimatedBee';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <LinearGradient colors={['#FFF8E1', '#F4E6D1', '#E6D3A3']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <HoneyDropAnimation score={85} />
        
        {/* Header avec logo + abeille animée */}
        <View style={styles.header}>
          <AnimatedBee />
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Api</Text>
            <Text style={styles.logoTextAccent}>Miel</Text>
          </View>
          <Text style={styles.tagline}>Vérifiez la pureté de votre miel</Text>
        </View>

        {/* Bouton de scan */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/scan')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FFD700', '#B8860B']}
            style={styles.scanButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Scan size={32} color="white" strokeWidth={3} />
            <Text style={styles.scanButtonText}>Scanner un pot de miel</Text>
            <Text style={styles.scanButtonEmoji}>🍯</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Fonctionnalités */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Comment ça marche ?</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Scan size={24} color="#B8860B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>1. Scannez</Text>
              <Text style={styles.featureDescription}>
                Pointez votre caméra sur le code-barres du pot de miel
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Sparkles size={24} color="#B8860B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>2. Analysez</Text>
              <Text style={styles.featureDescription}>
                Notre algorithme vérifie la composition et l'origine
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Award size={24} color="#B8860B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>3. Découvrez</Text>
              <Text style={styles.featureDescription}>
                Obtenez votre score ApiMiel de pureté (0-100)
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom info */}
        <View style={styles.bottomInfo}>
          <Shield size={20} color="#B8860B" />
          <Text style={styles.bottomInfoText}>
            Données provenant d'Open Food Facts
          </Text>
        </View>
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
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#B8860B',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  logoTextAccent: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  scanButton: {
    marginBottom: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginLeft: 12,
    marginRight: 8,
  },
  scanButtonEmoji: {
    fontSize: 24,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 25,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#A0522D',
    lineHeight: 20,
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
  bottomInfoText: {
    fontSize: 12,
    color: '#8B4513',
    marginLeft: 8,
  },
});