import { Tabs } from 'expo-router';
import { Home, Scan, BarChart3 } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#F4E6D1',
          borderTopColor: '#D4A574',
          borderTopWidth: 2,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#B8860B',
        tabBarInactiveTintColor: '#D4A574',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <Home size={size} color={color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ size, color }) => (
            <View style={[styles.iconContainer, styles.scanIcon]}>
              <Scan size={size + 4} color="#FFFFFF" strokeWidth={3} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Résultats',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <BarChart3 size={size} color={color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIcon: {
    backgroundColor: '#B8860B',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});