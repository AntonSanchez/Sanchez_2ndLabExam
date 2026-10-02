import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function AppLayout() {
  const { token, authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#245bb2" accessibilityLabel="Restoring session" />
      </View>
    );
  }

  // Second line of defence in addition to the guard in the root layout.
  if (!token) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#245bb2', headerTintColor: '#17324d', tabBarIconStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="students" options={{ title: 'Students' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f5fa' },
});
