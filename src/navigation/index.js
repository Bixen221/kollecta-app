import React, { useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Modal, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

import SplashScreen          from '../screens/auth/SplashScreen';
import ConnexionScreen       from '../screens/auth/ConnexionScreen';
import InscriptionScreen     from '../screens/auth/InscriptionScreen';
import AccueilScreen         from '../screens/dons/AccueilScreen';
import DonsScreen            from '../screens/dons/DonsScreen';
import DetailDonScreen       from '../screens/dons/DetailDonScreen';
import PublierDonScreen      from '../screens/dons/PublierDonScreen';
import EncheresScreen        from '../screens/encheres/EncheresScreen';
import DetailEnchereScreen   from '../screens/encheres/DetailEnchereScreen';
import PublierEnchereScreen  from '../screens/encheres/PublierEnchereScreen';
import ProfilScreen          from '../screens/profil/ProfilScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();
const Root  = createStackNavigator();

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', light: '#B0A090',
};

// ── Stacks ──────────────────────────────────────────────
const AccueilStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AccueilHome"    component={AccueilScreen} />
    <Stack.Screen name="DetailDon"      component={DetailDonScreen} />
    <Stack.Screen name="DetailEnchere"  component={DetailEnchereScreen} />
  </Stack.Navigator>
);

const DonsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListeDons"  component={DonsScreen} />
    <Stack.Screen name="DetailDon"  component={DetailDonScreen} />
  </Stack.Navigator>
);

const EncheresStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListeEncheres" component={EncheresScreen} />
    <Stack.Screen name="DetailEnchere" component={DetailEnchereScreen} />
  </Stack.Navigator>
);

// ── Tab Navigation ───────────────────────────────────────
const TabNavigation = ({ navigation }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.dark,
        borderTopColor: 'rgba(201,168,76,0.2)',
        paddingBottom: 8, paddingTop: 6, height: 65,
      },
      tabBarActiveTintColor:   COLORS.or,
      tabBarInactiveTintColor: COLORS.light,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      tabBarIcon: ({ focused, color }) => {
        if (route.name === 'Publier') {
          return (
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.or, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="add" size={28} color={COLORS.dark} />
            </View>
          );
        }
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
    <Tab.Screen
      name="Publier"
      component={AccueilStack}
      listeners={{ tabPress: e => { e.preventDefault(); navigation.navigate('ModalPublier'); } }}
      options={{ tabBarLabel: '' }}
    />
    <Tab.Screen name="Enchères"  component={EncheresStack} />
    <Tab.Screen name="Profil"    component={ProfilScreen} />
  </Tab.Navigator>
);

// ── Modal Publier ────────────────────────────────────────
const ModalPublierScreen = ({ navigation }) => (
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
    <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.goBack()} />
    <View style={styles.modalSheet}>
      <View style={styles.modalHandle} />
      <Text style={styles.modalTitre}>Que voulez-vous publier ?</Text>
      <Text style={styles.modalSous}>Choisissez le type d'annonce</Text>

      <TouchableOpacity
        style={styles.choixBtn}
        onPress={() => navigation.replace('PublierDon')}
      >
        <View style={[styles.choixIco, { backgroundColor: '#FFF8E8' }]}>
          <Text style={{ fontSize: 28 }}>🍱</Text>
        </View>
        <View style={styles.choixTxt}>
          <Text style={styles.choixTitre}>Don</Text>
          <Text style={styles.choixSous}>Offrez gratuitement nourriture ou matériel</Text>
        </View>
        <Text style={styles.choixArr}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.choixBtn}
        onPress={() => navigation.replace('PublierEnchere')}
      >
        <View style={[styles.choixIco, { backgroundColor: 'rgba(201,168,76,0.15)' }]}>
          <Text style={{ fontSize: 28 }}>🔨</Text>
        </View>
        <View style={styles.choixTxt}>
          <Text style={styles.choixTitre}>Enchère</Text>
          <Text style={styles.choixSous}>Vendez au meilleur prix en temps réel</Text>
        </View>
        <Text style={styles.choixArr}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.annulerBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.annulerTxt}>Annuler</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ── Root Navigation (avec modals) ────────────────────────
const MainNavigation = () => (
  <Root.Navigator screenOptions={{ headerShown: false }}>
    <Root.Screen name="Tabs"          component={TabNavigation} />
    <Root.Screen
      name="ModalPublier"
      component={ModalPublierScreen}
      options={{ presentation: 'transparentModal', animation: 'fade' }}
    />
    <Root.Screen
      name="PublierDon"
      component={PublierDonScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Root.Screen
      name="PublierEnchere"
      component={PublierEnchereScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
  </Root.Navigator>
);

// ── Auth Navigation ──────────────────────────────────────
const AuthNavigation = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash"      component={SplashScreen} />
    <Stack.Screen name="Connexion"   component={ConnexionScreen} />
    <Stack.Screen name="Inscription" component={InscriptionScreen} />
  </Stack.Navigator>
);

// ── Export principal ─────────────────────────────────────
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
      {user ? <MainNavigation /> : <AuthNavigation />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  modalSheet:  { backgroundColor: '#1E1612', borderRadius: 24, padding: 20, paddingBottom: 36, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  modalHandle: { width: 36, height: 4, backgroundColor: 'rgba(201,168,76,0.3)', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitre:  { fontSize: 20, fontWeight: '800', color: '#F0E8D8', marginBottom: 4 },
  modalSous:   { fontSize: 13, color: '#B0A090', marginBottom: 20 },
  choixBtn:    { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#2A1E18', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)' },
  choixIco:    { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  choixTxt:    { flex: 1 },
  choixTitre:  { fontSize: 16, fontWeight: '700', color: '#F0E8D8', marginBottom: 3 },
  choixSous:   { fontSize: 12, color: '#B0A090' },
  choixArr:    { fontSize: 20, color: '#B0A090' },
  annulerBtn:  { marginTop: 8, alignItems: 'center', padding: 12 },
  annulerTxt:  { fontSize: 14, color: '#B0A090', fontWeight: '600' },
});
