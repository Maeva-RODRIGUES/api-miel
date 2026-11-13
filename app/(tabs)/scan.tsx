import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useIsFocused } from 'expo-router';
import { X, Flashlight, FlashlightOff } from 'lucide-react-native';
import { ProductService } from '@/services/ProductService';
import { useScan } from '@/context/ScanContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { computeScore } from '@/utils/scoring';

export default function ScanScreen() {
  const { addScan } = useScan();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  // onBarcodeScanned est appelé à chaque image où la caméra voit le code.
  // Un ref change immédiatement (un state attend le rendu suivant) : il bloque
  // donc les appels en rafale avant que l'écran ne se mette à jour.
  const lockRef = useRef(false);

  // Les onglets restent montés : on relâche le verrou à chaque retour sur
  // l'écran, sinon le scanner reste bloqué après un premier scan.
  useFocusEffect(
    useCallback(() => {
      lockRef.current = false;
      setLoading(false);
      return () => setFlashOn(false);
    }, []),
  );

  const unlock = () => {
    lockRef.current = false;
  };

  const handleScan = async ({ data }: BarcodeScanningResult) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setLoading(true);

    try {
      const product = await ProductService.getProduct(data);

      if (product) {
        // Le résultat est rangé dans le contexte : l'écran Résultats le lit
        // directement, sans paramètres d'URL.
        addScan({ product, score: computeScore(product) });
        router.navigate('/results');
      } else {
        Alert.alert(
          'Produit non trouvé',
          'Ce code-barres ne correspond à aucun produit dans notre base de données.',
          [{ text: 'OK', onPress: unlock }],
        );
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du produit :', error);
      Alert.alert(
        'Erreur de connexion',
        'Impossible de récupérer les informations du produit. Vérifiez votre connexion internet.',
        [{ text: 'OK', onPress: unlock }],
      );
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Demande d'autorisation caméra...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Après un refus définitif, le système n'affiche plus la demande :
    // il ne reste que les réglages de l'appli.
    const onPress = permission.canAskAgain
      ? requestPermission
      : () => Linking.openSettings();
    return (
      <LinearGradient
        colors={['#FFF8E1', '#F4E6D1']}
        style={styles.permissionContainer}
      >
        <Text style={styles.permissionTitle}>Accès à la caméra requis</Text>
        <Text style={styles.permissionText}>
          ApiMiel a besoin d'accéder à votre caméra pour scanner les
          codes-barres des pots de miel.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={onPress}>
          <Text style={styles.permissionButtonText}>
            {permission.canAskAgain
              ? "Autoriser l'accès"
              : 'Ouvrir les réglages'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Montée seulement quand l'onglet est visible : caméra et lampe s'éteignent en le quittant. */}
      {isFocused && (
        <CameraView
          style={styles.scanner}
          facing="back"
          enableTorch={flashOn}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a'] }}
          onBarcodeScanned={handleScan}
        />
      )}

      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.navigate('/')}
          >
            <X size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scanner le code-barres</Text>
          <TouchableOpacity
            style={styles.flashButton}
            onPress={() => setFlashOn((on) => !on)}
          >
            {flashOn ? (
              <FlashlightOff size={28} color="white" />
            ) : (
              <Flashlight size={28} color="white" />
            )}
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.scanFrame}>
          <View style={styles.scanFrameCorner} />
          <View style={[styles.scanFrameCorner, styles.topRight]} />
          <View style={[styles.scanFrameCorner, styles.bottomLeft]} />
          <View style={[styles.scanFrameCorner, styles.bottomRight]} />
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.instructions}
        >
          <Text style={styles.instructionsText}>
            Pointez votre caméra sur le code-barres du pot de miel
          </Text>
          <Text style={styles.honeyEmoji}>🍯</Text>

          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Analyse en cours...</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  flashButton: {
    padding: 8,
  },
  scanFrame: {
    alignSelf: 'center',
    width: 250,
    height: 250,
    position: 'relative',
  },
  scanFrameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFD700',
    borderWidth: 4,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderLeftWidth: 0,
  },
  instructions: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  instructionsText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 10,
  },
  honeyEmoji: {
    fontSize: 32,
    marginTop: 10,
  },
  loadingContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255,215,0,0.9)',
    borderRadius: 20,
  },
  loadingText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B4513',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#A0522D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
