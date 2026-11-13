import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScanResult } from '@/types/Product';
import {
  HISTORY_STORAGE_KEY,
  type HistoryEntry,
  addToHistory,
  parseHistory,
} from '@/utils/history';

interface ScanContextValue {
  lastScan: ScanResult | null;
  /** Nouveau scan : devient le dernier scan et entre dans l'historique. */
  addScan: (scan: ScanResult) => void;
  /** Réaffiche un scan de l'historique, sans le dater à nouveau. */
  showScan: (scan: ScanResult) => void;
  history: HistoryEntry[];
  clearHistory: () => void;
}

// Le contexte partage le dernier scan et l'historique entre les écrans,
// sans les faire transiter par les paramètres de navigation.
const ScanContext = createContext<ScanContextValue | null>(null);

function saveHistory(history: HistoryEntry[]) {
  AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history)).catch(
    (error) => console.error('Sauvegarde de l’historique impossible :', error),
  );
}

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_STORAGE_KEY)
      .then((raw) => {
        const saved = parseHistory(raw);
        // Un scan fait pendant le chargement ne doit pas être écrasé.
        setHistory((current) =>
          current.length
            ? current.concat(
                saved.filter(
                  (s) =>
                    !current.some((c) => c.product.code === s.product.code),
                ),
              )
            : saved,
        );
      })
      .catch((error) =>
        console.error('Lecture de l’historique impossible :', error),
      );
  }, []);

  const addScan = useCallback((scan: ScanResult) => {
    setLastScan(scan);
    setHistory((current) => {
      const next = addToHistory(current, scan, Date.now());
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return (
    <ScanContext.Provider
      value={{
        lastScan,
        addScan,
        showScan: setLastScan,
        history,
        clearHistory,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan(): ScanContextValue {
  const value = useContext(ScanContext);
  if (!value) {
    throw new Error(
      'useScan doit être utilisé à l’intérieur de <ScanProvider>',
    );
  }
  return value;
}
