import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import SplashScreen      from '../screens/auth/SplashScreen';
import ConnexionScreen   from '../screens/auth/ConnexionScreen';
import InscriptionScreen from '../screens/auth/InscriptionScreen';

// App Screens
import AccueilScreen    from '../screens/dons/AccueilScreen';
import DonsScreen       from '../screens/dons/DonsScreen';
import DetailDonScreen  from '../screens/dons/DetailDonScreen';
import EncheresScreen   from '../screens/encheres/EncheresScreen';
import ProfilScreen     from '../screens/profil/ProfilScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', light: '#B0A090',
};

// Stack pour les dons
const DonsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListeDons"  component={DonsScreen} />
    <Stack.Screen name="DetailDon"  component={DetailDonScreen} />
  </Stack.Navigator>
);

// Stack pour l'accueil
const AccueilStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Accueil"   component={AccueilScreen} />
    <Stack.Screen name="DetailDon" component={DetailDonScreen} />
  </Stack.Navigator>
);

// Navigation principale avec tabs
const TabNavigation = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.dark,
        borderTopColor: 'rgba(201,168,76,0.2)',
        paddingBottom: 8,
        paddingTop: 6,
        height: 65,
      },
      tabBarActiveTintColor:   COLORS.or,
      tabBarInactiveTintColor: COLORS.light,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      tabBarIcon: ({ focused, color }) => {
        const icons = {
          Accueil:  focused ? 'home'   : 'home-outline',
          Dons:     focused ? 'gift'   : 'gift-outline',
          Enchères: focused ? 'hammer' : 'hammer-outline',
          Profil:   focused ? 'person' : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Accueil"   component={AccueilStack} />
    <Tab.Screen name="Dons"      component={DonsStack} />
    <Tab.Screen name="Enchères"  component={EncheresScreen} />
    <Tab.Screen name="Profil"    component={ProfilScreen} />
  </Tab.Navigator>
);

// Navigation auth
const AuthNavigation = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash"       component={SplashScreen} />
    <Stack.Screen name="Connexion"    component={ConnexionScreen} />
    <Stack.Screen name="Inscription"  component={InscriptionScreen} />
  </Stack.Navigator>
);

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark }}>
        <ActivityIndicator size="large" color={COLORS.or} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigation /> : <AuthNavigation />}
    </NavigationContainer>
  );
}
