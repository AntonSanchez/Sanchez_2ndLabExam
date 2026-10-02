import { type Student } from '@/components/StudentCard';
import { API_BASE_URL, API_PATHS } from '@/constants/api';
import { authHeaders, normalizePerson, pickMessage, pickNested, readJson } from '@/constants/apiHelpers';
import { useAuth } from '@/hooks/useAuth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function StudentDetailsScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token, logout } = useAuth();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStudent = useCallback(async () => {
    if (!id || !/^[\w-]+$/.test(id)) {
      setStudent(null);
      setError('Invalid student id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}${API_PATHS.studentById(id)}`, { headers: authHeaders(token) });
      const json = await readJson(response);

      if (response.status === 401) {
        setError('Your session has expired. Please sign in again.');
        await logout();
        return;
      }
      if (response.status === 404) {
        setStudent(null);
        setError('Student not found.');
        return;
      }
      if (!response.ok) {
        throw new Error(pickMessage(json, `Could not load student (${response.status}).`));
      }

      const record = normalizePerson(pickNested<unknown>(json, ['student', 'data']) ?? json);
      setStudent(record);
    } catch (e) {
      setStudent(null);
      setError(e instanceof TypeError ? 'Unable to reach the server. Check your connection and try again.'
        : e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, token, logout]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Student Details</Text>
      {loading ? <View style={styles.state}><ActivityIndicator color="#245bb2" /><Text style={styles.text}>Loading student…</Text></View>
        : error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
        : !student ? <Text style={styles.text}>No student record available.</Text> : null}
      {student && !loading && !error ? (
        <View style={styles.card}>
          <Text style={styles.text}>ID: {student.id ?? id}</Text>
          <Text style={styles.text}>Name: {student.name || '—'}</Text>
          <Text style={styles.text}>Email: {student.email || '—'}</Text>
          <Text style={styles.text}>Course: {student.course || '—'}</Text>
        </View>
      ) : null}
      {error && !loading ? (
        <Pressable accessibilityRole="button" onPress={loadStudent}><Text style={styles.link}>Try Again</Text></Pressable>
      ) : null}
      <Pressable accessibilityRole="button" style={styles.button} onPress={() => router.back()}><Text style={styles.buttonText}>Back</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 20, backgroundColor: '#f2f5fa' },
  title: { color: '#17324d', fontSize: 28, fontWeight: '700' },
  state: { gap: 12, alignItems: 'center' },
  card: { backgroundColor: '#ffffff', padding: 20, gap: 16, borderRadius: 12 },
  text: { color: '#536579', fontSize: 16 },
  error: { color: '#b42318' },
  link: { color: '#245bb2', padding: 12 },
  button: { backgroundColor: '#245bb2', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '600' },
});
