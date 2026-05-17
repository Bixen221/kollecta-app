import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

import SplashScreen         from '../screens/auth/SplashScreen';
import ConnexionScreen      from '../screens/auth/ConnexionScreen';
import InscriptionScreen    from '../screens/auth/InscriptionScreen';
import AccueilScreen        from '../screens/dons/AccueilScreen';
import DonsScreen           from '../screens/dons/DonsScreen';
import DetailDonScreen      from '../screens/dons/DetailDonScreen';
import PublierDonScreen     from '../screens/dons/PublierDonScreen';
import EncheresScreen       from '../screens/encheres/EncheresScreen';
import DetailEnchereScreen  from '../screens/encheres/DetailEnchereScreen';
import ProfilScreen         from '../screens/profil/ProfilScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', light: '#B0A090',
};

const DonsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListeDons"  component={DonsScreen} />
    <Stack.Screen name="DetailDon"  component={DetailDonScreen} />
    <Stack.Screen name="PublierDon" component={PublierDonScreen} />
  </Stack.Navigator>
);

const AccueilStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AccueilHome"   component={AccueilScreen} />
    <Stack.Screen name="DetailDon"     component={DetailDonScreen} />
    <Stack.Screen name="DetailEnchere" component={DetailEnchereScreen} />
    <Stack.Screen name="PublierDon"    component={PublierDonScreen} />
  </Stack.Navigator>
);

const EncheresStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListeEncheres" component={EncheresScreen} />
    <Stack.Screen name="DetailEnchere" component={DetailEnchereScreen} />
  </Stack.Navigator>
);

const TabNavigation = ({ navigation }) => (
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
          Publier:  'add-circle',
          Enchères: focused ? 'hammer' : 'hammer-outline',
          Profil:   focused ? 'person' : 'person-outline',
        };
        if (route.name === 'Publier') {
          return (
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.or, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="add" size={28} color={COLORS.dark} />
            </View>
          );
        }
        return <Ionicons name={icons[route.name]} size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Accueil"   component={AccueilStack} />
    <Tab.Screen name="Dons"      component={DonsStack} />
    <Tab.Screen
      name="Publier"
      component={PublierDonScreen}
      options={{
        tabBarLabel: 'Publier',
        tabBarActiveTintColor: COLORS.or,
      }}
    />
    <Tab.Screen name="Enchères"  component={EncheresStack} />
    <Tab.Screen name="Profil"    component={ProfilScreen} />
  </Tab.Navigator>
);

const AuthNavigation = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash"      component={SplashScreen} />
    <Stack.Screen name="Connexion"   component={ConnexionScreen} />
    <Stack.Screen name="Inscription" component={InscriptionScreen} />
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
