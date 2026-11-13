import React, { createContext, useContext, useState } from 'react';
import type { ScanResult } from '@/types/Product';

interface ScanContextValue {
  lastScan: ScanResult | null;
  setLastScan: (scan: ScanResult) => void;
}

// Le contexte partage le dernier scan entre les écrans Scanner et Résultats,
// sans le faire transiter par les paramètres de navigation.
const ScanContext = createContext<ScanContextValue | null>(null);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  return (
    <ScanContext.Provider value={{ lastScan, setLastScan }}>
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
