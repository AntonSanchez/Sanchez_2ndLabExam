import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';

function RootNavigator() {
  const { token, authLoading } = useAuth();
  const isAuthenticated = Boolean(token);

  // Wait for session restoration so a signed-in user is not flashed the sign-in screen.
  if (authLoading) {
    return (
      <View style={styles.loading} accessibilityLiveRegion="polite">
        <ActivityIndicator size="large" color="#245bb2" accessibilityLabel="Restoring session" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerTintColor: '#17324d' }}>
      {/* Public: only reachable while signed out. */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="sign-in" options={{ title: 'Sign In' }} />
      </Stack.Protected>

      {/* Private: the tabs AND the dynamic student route. Unauthenticated users are sent to /sign-in. */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="student/[id]" options={{ title: 'Student Details' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f5fa' },
});
