import React from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2 } from 'lucide-react-native';
import { useScan } from '@/context/ScanContext';
import type { HistoryEntry } from '@/utils/history';
import { hasNoCategory, verdict } from '@/utils/scoring';

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function status(entry: HistoryEntry) {
  if (entry.score) {
    const v = verdict(entry.score.score);
    return { text: `${entry.score.score}/100`, color: v.color };
  }
  return hasNoCategory(entry.product)
    ? { text: 'Fiche incomplète', color: '#A0522D' }
    : { text: 'Pas un miel', color: '#A0522D' };
}

export default function HistoryScreen() {
  const { history, showScan, clearHistory } = useScan();
  const insets = useSafeAreaInsets();

  const open = (entry: HistoryEntry) => {
    showScan({ product: entry.product, score: entry.score });
    router.navigate('/results');
  };

  const confirmClear = () => {
    Alert.alert(
      'Effacer l’historique ?',
      'Tous les pots scannés seront retirés de cette liste.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer', style: 'destructive', onPress: clearHistory },
      ],
    );
  };

  return (
    <LinearGradient
      colors={['#FFF8E1', '#F4E6D1', '#E6D3A3']}
      style={styles.container}
    >
      <FlatList
        data={history}
        keyExtractor={(entry) => entry.product.code}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Historique</Text>
            {history.length > 0 && (
              <TouchableOpacity
                onPress={confirmClear}
                style={styles.clearButton}
                accessibilityLabel="Effacer l’historique"
              >
                <Trash2 size={20} color="#A0522D" />
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🐝</Text>
            <Text style={styles.emptyText}>
              Les pots que vous scannez apparaîtront ici.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const s = status(item);
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => open(item)}
              activeOpacity={0.8}
            >
              {item.product.image_url ? (
                <Image
                  source={{ uri: item.product.image_url }}
                  style={styles.thumb}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Text>🍯</Text>
                </View>
              )}
              <View style={styles.rowText}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.product.product_name}
                </Text>
                <Text style={styles.date}>
                  {dateFormat.format(item.scannedAt)}
                </Text>
              </View>
              <Text style={[styles.status, { color: s.color }]}>{s.text}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  clearButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0522D',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  thumbPlaceholder: {
    backgroundColor: '#F4E6D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  date: {
    fontSize: 13,
    color: '#A0522D',
    marginTop: 2,
  },
  status: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
