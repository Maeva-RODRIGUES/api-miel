import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { X, Flashlight, FlashlightOff } from 'lucide-react-native';
import { ProductService } from '@/services/ProductService';
import { ScanResult } from '@/types/Product';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async (data: string) => {
    if (scanned) return;

    setScanned(true);
    setLoading(true);

    try {
      const product = await ProductService.getProduct(data);

      if (product) {
        router.push({
          pathname: '/results',
          params: {
            productData: JSON.stringify(product),
            barcode: data,
          },
        });
      } else {
        Alert.alert(
          'Produit non trouv\u00e9',
          'Ce code-barres ne correspond \u00e0 aucun produit dans notre base de donn\u00e9es.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la r\u00e9cup\u00e9ration du produit:', error);
      Alert.alert(
        'Erreur de connexion',
        "Impossible de r\u00e9cup\u00e9rer les informations du produit. V\u00e9rifiez votre connexion internet.",
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const onBarCodeScanned = ({ data }: { data: string }) => {
    handleBarCodeScanned(data);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Demande d'autorisation cam\u00e9ra...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <LinearGradient colors={['#FFF8E1', '#F4E6D1']} style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Acc\u00e8s \u00e0 la cam\u00e9ra requis</Text>
        <Text style={styles.permissionText}>
          ApiMiel a besoin d'acc\u00e9der \u00e0 votre cam\u00e9ra pour scanner les codes-barres des pots de miel.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text style={styles.permissionButtonText}>Autoriser l'acc\u00e8s</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.scanner}
        type={CameraType.back}
        flashMode={flashOn ? 'torch' : 'off'}
        onBarCodeScanned={scanned ? undefined : onBarCodeScanned}
      />

      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scanner le code-barres</Text>
          <TouchableOpacity
            style={styles.flashButton}
            onPress={toggleFlash}
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
            Pointez votre cam\u00e9ra sur le code-barres du pot de miel
          </Text>
          <Text style={styles.honeyEmoji}>\ud83c\udf6f</Text>

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
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
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
    paddingBottom: 120,
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