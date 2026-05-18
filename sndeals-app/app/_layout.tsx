import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0705' }}>
        <ActivityIndicator size="large" color="#CFA52D" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="screens/Login" />
      <Stack.Screen name="screens/Register" />
      <Stack.Screen name="screens/Home" />
      <Stack.Screen name="screens/ProductDetail" />
      <Stack.Screen name="screens/Vendre" />
      <Stack.Screen name="screens/Profil" />
      <Stack.Screen name="screens/Conversations" />
      <Stack.Screen name="screens/Chat" />
      <Stack.Screen name="screens/MesAnnonces" />
      <Stack.Screen name="screens/ModifierAnnonce" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
