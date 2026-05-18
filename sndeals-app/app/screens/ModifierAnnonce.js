import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../services/api.js';

const STATUTS = [
  { value: 'available', label: 'En ligne' },
  { value: 'reserved', label: 'Reserve' },
  { value: 'sold', label: 'Vendu' },
];

export default function ModifierAnnonce() {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  const [ville, setVille] = useState('');
  const [status, setStatus] = useState('available');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { id } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => { chargerDonnees(); }, [id]);

  async function chargerDonnees() {
    try {
      const [produitRes, catsRes] = await Promise.all([
        api.get('/products/' + id),
        api.get('/categories')
      ]);
      const p = produitRes.data;
      setTitre(p.title || '');
      setDescription(p.description || '');
      setPrix(String(p.price) || '');
      setVille(p.location || '');
      setStatus(p.status || 'available');
      setCategoryId(String(p.categoryId) || '');
      setCategories(catsRes.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le produit');
    } finally {
      setLoading(false);
    }
  }

  async function handleModifier() {
    if (!titre || !prix) { Alert.alert('Erreur', 'Titre et prix requis'); return; }
    setSaving(true);
    try {
      await api.put('/products/' + id, {
        title: titre,
        description,
        price: Number(prix),
        categoryId: Number(categoryId),
        location: ville,
        status,
      });
      Alert.alert('Modifie !', 'Ton annonce a ete mise a jour', [
        { text: 'OK', onPress: () => router.replace('./MesAnnonces') }
      ]);
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.error || 'Erreur modification');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator size="large" color="#1BAA6B" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>? Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier l annonce</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Infos principales</Text>

          <Text style={styles.label}>Titre</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder="Titre de l annonce" placeholderTextColor="#bbb" value={titre} onChangeText={setTitre} />
          </View>

          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputBox, styles.textareaBox]}>
            <TextInput style={[styles.input, styles.textarea]} placeholder="Description..." placeholderTextColor="#bbb" value={description} onChangeText={setDescription} multiline numberOfLines={4} />
          </View>

          <Text style={styles.label}>Prix (FCFA)</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputPrefix}>FCFA</Text>
            <TextInput style={styles.input} placeholder="85000" placeholderTextColor="#bbb" value={prix} onChangeText={setPrix} keyboardType="numeric" />
          </View>

          <Text style={styles.label}>Ville</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder="Dakar" placeholderTextColor="#bbb" value={ville} onChangeText={setVille} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsRow}>
              {categories.map(cat => (
                <TouchableOpacity key={cat.id} style={[styles.optionBtn, categoryId === String(cat.id) && styles.optionBtnActive]} onPress={() => setCategoryId(String(cat.id))}>
                  <Text style={styles.optionIcon}>{cat.icon}</Text>
                  <Text style={[styles.optionText, categoryId === String(cat.id) && styles.optionTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut</Text>
          <View style={styles.optionsRow}>
            {STATUTS.map(s => (
              <TouchableOpacity key={s.value} style={[styles.statutBtn, status === s.value && styles.statutBtnActive]} onPress={() => setStatus(s.value)}>
                <Text style={[styles.statutText, status === s.value && styles.statutTextActive]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleModifier} disabled={saving} activeOpacity={0.85}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Enregistrer les modifications</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backText: { fontSize: 15, color: '#1BAA6B', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  form: { padding: 16, paddingBottom: 60 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  inputBox: { backgroundColor: '#F8F8F8', borderRadius: 12, borderWidth: 1.5, borderColor: '#e8e8e8', paddingHorizontal: 16, height: 52, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  textareaBox: { height: 110, alignItems: 'flex-start', paddingVertical: 14 },
  inputPrefix: { fontSize: 13, color: '#1BAA6B', fontWeight: '800', marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#111' },
  textarea: { height: '100%', textAlignVertical: 'top' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#F8F8F8' },
  optionBtnActive: { backgroundColor: '#E8F5EE', borderColor: '#1BAA6B' },
  optionIcon: { fontSize: 16 },
  optionText: { fontSize: 13, fontWeight: '600', color: '#666' },
  optionTextActive: { color: '#1BAA6B' },
  statutBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100, borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#F8F8F8' },
  statutBtnActive: { backgroundColor: '#E8F5EE', borderColor: '#1BAA6B' },
  statutText: { fontSize: 13, fontWeight: '600', color: '#666' },
  statutTextActive: { color: '#1BAA6B' },
  btn: { backgroundColor: '#1BAA6B', borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: '#1BAA6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
