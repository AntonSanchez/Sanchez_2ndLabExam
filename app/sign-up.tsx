import { API_BASE_URL, API_PATHS } from '@/constants/api';
import { authHeaders, normalizePerson, pickMessage, pickNested, pickToken, readJson } from '@/constants/apiHelpers';
import { useAuth } from '@/hooks/useAuth';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

async function saveStudentRecord(accessToken: string, userId: string | number | undefined, name: string, email: string) {
  try {
    await fetch(`${API_BASE_URL}${API_PATHS.students}`, {
      method: 'POST',
      headers: { ...authHeaders(accessToken), 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, email }),
    });
  } catch (e) {
    console.warn('Could not create the student record:', e);
  }
}

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { login, token } = useAuth();

  useEffect(() => {
    if (token) router.replace('/(app)');
  }, [token, router]);

  const handleSignUp = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) {
      setError('Please enter your name, email and password.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}${API_PATHS.register}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password }),
      });
      const json = await readJson(response);

      if (!response.ok) {
        const fallback = response.status === 409
          ? 'An account with this email already exists.'
          : `Sign up failed (${response.status}).`;
        throw new Error(pickMessage(json, fallback));
      }

      const accessToken = pickToken(json);
      if (accessToken) {
        const userData = normalizePerson(pickNested<unknown>(json, ['user', 'profile', 'data']) ?? json) ?? { name: trimmedName, email: trimmedEmail };
        await saveStudentRecord(accessToken, userData.id, trimmedName, trimmedEmail);
        await login(accessToken, userData);
        setPassword('');
      } else {
        router.replace({ pathname: '/sign-in', params: { registered: '1' } });
      }
    } catch (e) {
      setError(e instanceof TypeError ? 'Unable to reach the server. Check your connection and try again.'
        : e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.eyebrow}>CCE106 • PRACTICAL EXAMINATION</Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up as a student to use the portal.</Text>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} accessibilityLabel="Name" placeholder="Juan Dela Cruz" value={name} onChangeText={setName} autoCapitalize="words" />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} accessibilityLabel="Email" placeholder="student@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} accessibilityLabel="Password" placeholder="At least 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
        <View style={styles.feedback} accessibilityLiveRegion="polite">
          {loading && <ActivityIndicator color="#245bb2" accessibilityLabel="Creating account" />}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <Pressable accessibilityRole="button" style={styles.button} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Sign Up'}</Text>
        </Pressable>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/sign-in" style={styles.link}>Login</Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f2f5fa' },
  card: { width: '100%', maxWidth: 440, alignSelf: 'center', padding: 24, borderRadius: 16, backgroundColor: '#ffffff' },
  eyebrow: { fontSize: 11, fontWeight: '700', color: '#245bb2', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#17324d' },
  subtitle: { color: '#536579', marginTop: 8, marginBottom: 24 },
  label: { color: '#17324d', fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#c6d2e1', borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 16, color: '#17324d' },
  feedback: { minHeight: 28 },
  error: { color: '#b42318' },
  button: { backgroundColor: '#245bb2', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 },
  footerText: { color: '#536579' },
  link: { color: '#245bb2', fontWeight: '700' },
});
