import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api.js';

const ETATS = ['Neuf', 'Bon etat', 'Correct'];

export default function Vendre() {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  const [ville, setVille] = useState('');
  const [etat, setEtat] = useState('Bon etat');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { chargerCategories(); }, []);

  async function chargerCategories() {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur categories:', error);
    }
  }

  async function handlePublier() {
    if (!titre || !prix || !categoryId) {
      Alert.alert('Champs manquants', 'Titre, prix et categorie sont requis');
      return;
    }
    setLoading(true);
    try {
      await api.post('/products', {
        title: titre,
        description,
        price: Number(prix),
        categoryId: Number(categoryId),
        location: ville,
      });
      Alert.alert('Publie !', 'Ton annonce est en ligne', [
        { text: 'OK', onPress: () => router.replace('./Home') }
      ]);
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.error || 'Erreur publication');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>? Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle annonce</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Infos principales</Text>

          <Text style={styles.label}>Titre de l annonce</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder="Ex: Samsung Galaxy A33" placeholderTextColor="#bbb" value={titre} onChangeText={setTitre} />
          </View>

          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputBox, styles.textareaBox]}>
            <TextInput style={[styles.input, styles.textarea]} placeholder="Decris ton objet en detail..." placeholderTextColor="#bbb" value={description} onChangeText={setDescription} multiline numberOfLines={4} />
          </View>

          <Text style={styles.label}>Prix (FCFA)</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputPrefix}>FCFA</Text>
            <TextInput style={styles.input} placeholder="85000" placeholderTextColor="#bbb" value={prix} onChangeText={setPrix} keyboardType="numeric" />
          </View>

          <Text style={styles.label}>Ville</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder="Ex: Dakar" placeholderTextColor="#bbb" value={ville} onChangeText={setVille} />
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
          <Text style={styles.sectionTitle}>Etat de l objet</Text>
          <View style={styles.optionsRow}>
            {ETATS.map(e => (
              <TouchableOpacity key={e} style={[styles.etatBtn, etat === e && styles.etatBtnActive]} onPress={() => setEtat(e)}>
                <Text style={[styles.etatText, etat === e && styles.etatTextActive]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handlePublier} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Publier l annonce</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
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
  etatBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100, borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#F8F8F8' },
  etatBtnActive: { backgroundColor: '#E8F5EE', borderColor: '#1BAA6B' },
  etatText: { fontSize: 13, fontWeight: '600', color: '#666' },
  etatTextActive: { color: '#1BAA6B' },
  btn: { backgroundColor: '#1BAA6B', borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: '#1BAA6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
