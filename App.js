import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import CategoryDetailScreen from './screens/CategoryDetailScreen';
import AddProductScreen from './screens/AddProductScreen'; // Eklendi
import NotesScreen from './screens/NotesScreen'; // Eklendi
import FinanceScreen from './screens/FinanceScreen'; // Eklendi
import SettingsScreen from './screens/SettingsScreen'; // Eklendi
import VeresiyeScreen from './screens/VeresiyeScreen'; // Eklendi
import VeresiyeDetailScreen from './screens/VeresiyeDetailScreen'; // Eklendi
import { initDatabase } from './services/database'; // Eklendi

const Stack = createNativeStackNavigator();

export default function App() {
  React.useEffect(() => {
    initDatabase(); // Veritabanını başlat
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="CategoryDetail"
          component={CategoryDetailScreen}
          options={{ headerShown: true, title: 'Ürünler' }}
        />
        <Stack.Screen
          name="AddProduct"
          component={AddProductScreen}
          options={{ headerShown: true, title: 'Yeni Ürün Ekle' }}
        />
        <Stack.Screen
          name="Notes"
          component={NotesScreen}
          options={{ headerShown: true, title: 'Asistan' }}
        />
        <Stack.Screen
          name="Finance"
          component={FinanceScreen}
          options={{ headerShown: true, title: 'Finans' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: true, title: 'Ayarlar' }}
        />
        <Stack.Screen
          name="Veresiye"
          component={VeresiyeScreen}
          options={{ headerShown: true, title: 'Veresiye Defteri' }}
        />
        <Stack.Screen
          name="VeresiyeDetail"
          component={VeresiyeDetailScreen}
          options={{ headerShown: true, title: 'Müşteri Detayı' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
