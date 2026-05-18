import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Remplace par l'IP de ton PC (pas localhost)
// Pour trouver ton IP : tape "ipconfig" dans le terminal
const BASE_URL = 'http://192.168.1.79:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Ajouter le token automatiquement à chaque requête
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;