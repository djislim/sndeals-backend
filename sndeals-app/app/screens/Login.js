import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Erreur', 'Remplis tous les champs'); return; }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('./Home');
    } catch (error) {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.logoWrap}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>SN</Text>
          </View>
          <Text style={styles.logo}>Sn<Text style={styles.logoAccent}>Deals</Text></Text>
          <Text style={styles.tagline}>Le marche d occasion numero 1 au Senegal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connexion</Text>
          <Text style={styles.cardSubtitle}>Content de te revoir</Text>

          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputBox, emailFocused && styles.inputBoxFocused]}>
            <TextInput
              style={styles.input}
              placeholder="ton@email.com"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          <Text style={styles.label}>Mot de passe</Text>
          <View style={[styles.inputBox, passFocused && styles.inputBoxFocused]}>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 caracteres"
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Se connecter</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.btnOutline} onPress={() => router.push('./Register')} activeOpacity={0.85}>
            <Text style={styles.btnOutlineText}>Creer un compte gratuit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trustRow}>
          <Text style={styles.trustItem}>Wave</Text>
          <Text style={styles.trustDot}>·</Text>
          <Text style={styles.trustItem}>Orange Money</Text>
          <Text style={styles.trustDot}>·</Text>
          <Text style={styles.trustItem}>Escrow securise</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoBadge: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#E8F5EE', borderWidth: 2, borderColor: '#1BAA6B', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoBadgeText: { fontSize: 22, fontWeight: '900', color: '#1BAA6B' },
  logo: { fontSize: 32, fontWeight: '900', color: '#111' },
  logoAccent: { color: '#1BAA6B' },
  tagline: { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  cardTitle: { fontSize: 24, fontWeight: '900', color: '#111', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#999', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  inputBox: { backgroundColor: '#F8F8F8', borderRadius: 12, borderWidth: 1.5, borderColor: '#e8e8e8', paddingHorizontal: 16, height: 52, marginBottom: 16 },
  inputBoxFocused: { borderColor: '#1BAA6B', backgroundColor: '#F0FAF5' },
  input: { flex: 1, fontSize: 15, color: '#111', height: '100%' },
  btn: { backgroundColor: '#1BAA6B', borderRadius: 12, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 4, shadowColor: '#1BAA6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { fontSize: 12, color: '#bbb', marginHorizontal: 12 },
  btnOutline: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, height: 54, alignItems: 'center', justifyContent: 'center' },
  btnOutlineText: { fontSize: 15, fontWeight: '600', color: '#666' },
  trustRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 8 },
  trustItem: { fontSize: 12, color: '#bbb', fontWeight: '500' },
  trustDot: { fontSize: 12, color: '#ddd' },
});
