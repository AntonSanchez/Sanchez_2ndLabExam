import { authHeaders, normalizePerson, pickMessage, pickNested, profileUrl, readJson } from '@/constants/apiHelpers';
import type { User } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(profileUrl(token), { headers: authHeaders(token) });
      const json = await readJson(response);

      if (response.status === 401) {
        setError('Your session has expired. Please sign in again.');
        await logout();
        return;
      }
      if (!response.ok) {
        throw new Error(pickMessage(json, `Could not load profile (${response.status}).`));
      }

      setProfile(normalizePerson(pickNested<unknown>(json, ['user', 'profile', 'data']) ?? json));
    } catch (e) {
      setError(e instanceof TypeError ? 'Unable to reach the server. Check your connection and try again.'
        : e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const shown = profile ?? user;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>MY PROFILE</Text>
      <View style={styles.card}>
        {loading ? (
          <View style={styles.state}><ActivityIndicator color="#245bb2" /><Text style={styles.text}>Loading profile…</Text></View>
        ) : null}
        {error && !loading ? (
          <View style={styles.state} accessibilityLiveRegion="polite">
            <Text style={styles.error}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={loadProfile}><Text style={styles.link}>Try Again</Text></Pressable>
          </View>
        ) : null}
        <Text style={styles.text}>Name: {shown?.name || '—'}</Text>
        <Text style={styles.text}>Email: {shown?.email || '—'}</Text>
        <Text style={styles.text}>Role: {shown?.role || '—'}</Text>
        {!shown && !loading && !error ? <Text style={styles.note}>No profile available.</Text> : null}
      </View>
      <Text style={styles.text}>Session Status: {token ? 'Authenticated' : 'Not Available'}</Text>
      <Pressable accessibilityRole="button" style={styles.button} onPress={logout}><Text style={styles.buttonText}>LOGOUT</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 20, backgroundColor: '#f2f5fa' },
  title: { color: '#17324d', fontSize: 24, fontWeight: '700' },
  card: { backgroundColor: '#ffffff', padding: 20, gap: 16, borderRadius: 12 },
  text: { color: '#536579', fontSize: 16 },
  note: { color: '#536579', fontSize: 12 },
  state: { gap: 12, alignItems: 'center' },
  error: { color: '#b42318' },
  link: { color: '#245bb2', padding: 12 },
  button: { backgroundColor: '#245bb2', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '600' },
});
