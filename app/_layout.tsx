import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ScanProvider } from '@/context/ScanContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ScanProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      {/* Fonds crème : icônes sombres. L'écran Scanner passe en clair. */}
      <StatusBar style="dark" />
    </ScanProvider>
  );
}
