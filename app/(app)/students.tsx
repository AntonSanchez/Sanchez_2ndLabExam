import StudentCard, { type Student } from '@/components/StudentCard';
import { API_BASE_URL, API_PATHS } from '@/constants/api';
import { authHeaders, normalizePeople, pickList, pickMessage, readJson } from '@/constants/apiHelpers';
import { useAuth } from '@/hooks/useAuth';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function StudentsScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const { token, logout } = useAuth();

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}${API_PATHS.students}`, { headers: authHeaders(token) });
      const json = await readJson(response);

      if (response.status === 401) {
        setError('Your session has expired. Please sign in again.');
        await logout();
        return;
      }
      if (!response.ok) {
        throw new Error(pickMessage(json, `Could not load students (${response.status}).`));
      }

      const list = pickList<unknown>(json);
      if (!list) throw new Error('Unexpected response from the server.');
      setStudents(normalizePeople(list));
    } catch (e) {
      setError(e instanceof TypeError ? 'Unable to reach the server. Check your connection and try again.'
        : e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const query = search.trim().toLowerCase();
  const filteredStudents = useMemo(
    () => (query ? students.filter((student) => (student.name ?? '').toLowerCase().includes(query)) : students),
    [students, query],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students</Text>
      <TextInput style={styles.input} accessibilityLabel="Search students" placeholder="Search by name" value={search} onChangeText={setSearch} />
      {loading ? (
        <View style={styles.state}><ActivityIndicator color="#245bb2" /><Text style={styles.text}>Loading students…</Text></View>
      ) : error ? (
        <View style={styles.state} accessibilityLiveRegion="polite"><Text style={styles.error}>{error}</Text><Pressable accessibilityRole="button" onPress={loadStudents}><Text style={styles.link}>Try Again</Text></Pressable></View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item, index) => String(item.id ?? index)}
          renderItem={({ item }) => <StudentCard student={item} />}
          ListEmptyComponent={<View style={styles.state}><Text style={styles.text}>{query ? `No students match “${search.trim()}”.` : 'No students found.'}</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f2f5fa' },
  title: { fontSize: 28, fontWeight: '700', color: '#17324d', marginBottom: 20 },
  input: { padding: 14, borderWidth: 1, borderColor: '#c6d2e1', borderRadius: 8, backgroundColor: '#ffffff', color: '#17324d', marginBottom: 20 },
  state: { padding: 24, gap: 12, alignItems: 'center' },
  text: { color: '#536579' },
  error: { color: '#b42318' },
  link: { color: '#245bb2', padding: 12 },
});
