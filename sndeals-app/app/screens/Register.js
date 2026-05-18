import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.js';

export default function Register() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleRegister() {
    if (!nom || !email || !password) { Alert.alert('Erreur', 'Nom, email et mot de passe requis'); return; }
    if (password.length < 6) { Alert.alert('Erreur', 'Mot de passe minimum 6 caracteres'); return; }
    setLoading(true);
    try {
      await register({ name: nom, email, password, phone, location });
      router.replace('./Home');
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.error || 'Erreur inscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>? Retour</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>Sn<Text style={styles.logoAccent}>Deals</Text></Text>
        <Text style={styles.tagline}>Cree ton compte gratuitement</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inscription</Text>
          <Text style={styles.cardSubtitle}>Rejoins la communaute SnDeals</Text>

          <Text style={styles.label}>Prenom et Nom</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder="Moussa Diallo" placeholderTextColor="#bbb" value={nom} onChangeText={setNom} />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder="ton@email.com" placeholderTextColor="#bbb" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <Text style={styles.label}>Telephone (WhatsApp)</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder="+221 77 000 00 00" placeholderTextColor="#bbb" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>

          <Text style={styles.label}>Ville</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder="Dakar" placeholderTextColor="#bbb" value={location} onChangeText={setLocation} />
          </View>

          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder="Minimum 6 caracteres" placeholderTextColor="#bbb" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Creer mon compte</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.btnOutline} onPress={() => router.push('./Login')} activeOpacity={0.85}>
            <Text style={styles.btnOutlineText}>Deja un compte ? Se connecter</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 56 },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 15, color: '#1BAA6B', fontWeight: '600' },
  logo: { fontSize: 30, fontWeight: '900', color: '#111', marginBottom: 4 },
  logoAccent: { color: '#1BAA6B' },
  tagline: { fontSize: 13, color: '#999', marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  cardTitle: { fontSize: 24, fontWeight: '900', color: '#111', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#999', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  inputBox: { backgroundColor: '#F8F8F8', borderRadius: 12, borderWidth: 1.5, borderColor: '#e8e8e8', paddingHorizontal: 16, height: 52, marginBottom: 16 },
  input: { flex: 1, fontSize: 15, color: '#111', height: '100%' },
  btn: { backgroundColor: '#1BAA6B', borderRadius: 12, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 4, shadowColor: '#1BAA6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { fontSize: 12, color: '#bbb', marginHorizontal: 12 },
  btnOutline: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, height: 54, alignItems: 'center', justifyContent: 'center' },
  btnOutlineText: { fontSize: 15, fontWeight: '600', color: '#666' },
});
