import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext.js';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('./screens/Home');
      } else {
        router.replace('./screens/Login');
      }
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5EDD8' }}>
      <ActivityIndicator size="large" color="#CFA52D" />
    </View>
  );
}