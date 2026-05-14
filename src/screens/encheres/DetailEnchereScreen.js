import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, TextInput, Animated
} from 'react-native';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', dark2: '#1A120E',
  light: '#B0A090', bd: 'rgba(201,168,76,0.2)', gr: '#2D7A4F',
};

const API_URL = 'https://kollecta-backend.onrender.com';

const getTempsRestant = (fin_le) => {
  const diff = new Date(fin_le) - new Date();
  if (diff <= 0) return { texte: 'Terminée', urgent: false };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 24) return { texte: `${Math.floor(h/24)}j ${h%24}h`, urgent: false };
  if (h > 1)  return { texte: `${h}h ${m}m`, urgent: false };
  return { texte: `${h}h ${m}m ${s}s`, urgent: true };
};

export default function DetailEnchereScreen({ route, navigation }) {
  const { enchereId }  = route.params;
  const { user, token } = useAuth();
  const [enchere,    setEnchere]    = useState(null);
  const [offres,     setOffres]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [montant,    setMontant]    = useState('');
  const [placing,    setPlacing]    = useState(false);
  const [temps,      setTemps]      = useState(null);
  const [connected,  setConnected]  = useState(false);
  const socketRef    = useRef(null);
  const pulseAnim    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    charger();
    connecterSocket();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Timer en direct
  useEffect(() => {
    if (!enchere) return;
    const interval = setInterval(() => {
      setTemps(getTempsRestant(enchere.fin_le));
    }, 1000);
    return () => clearInterval(interval);
  }, [enchere]);

  // Animation pulse pour les nouvelles offres
  const animerPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 200, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const charger = async () => {
    try {
      const res = await api.get(`/encheres/${enchereId}`);
      setEnchere(res.enchere);
      setOffres(res.offres || []);
      setTemps(getTempsRestant(res.enchere.fin_le));
    } catch (err) {
      Alert.alert('Erreur', err.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const connecterSocket = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const socket = io(API_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('rejoindre_enchere', enchereId);
      });

      socket.on('disconnect', () => setConnected(false));

      socket.on('nouvelle_offre', (data) => {
        setEnchere(prev => ({
          ...prev,
          offre_actuelle: data.montant,
          meilleur_offrant_id: data.offreur.id,
          nb_offres: (prev.nb_offres || 0) + 1,
        }));
        setOffres(prev => [{ ...data, nom: data.offreur.nom, prenom: data.offreur.prenom }, ...prev]);
        animerPulse();
      });

      socket.on('erreur_offre', (data) => {
        Alert.alert('Erreur', data.message);
        setPlacing(false);
      });

      socketRef.current = socket;
    } catch (err) {
      console.error('Socket error:', err);
    }
  };

  const handlePlacerOffre = async () => {
    const montantNum = parseInt(montant);
    if (!montantNum || montantNum <= enchere.offre_actuelle) {
      return Alert.alert('Erreur', `L'offre doit être supérieure à ${enchere.offre_actuelle?.toLocaleString()} FCFA`);
    }
    setPlacing(true);
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('placer_offre', { enchere_id: enchereId, montant: montantNum });
        setShowModal(false);
        setMontant('');
        setPlacing(false);
      } else {
        await api.post(`/encheres/${enchereId}/offrir`, { montant: montantNum });
        setShowModal(false);
        setMontant('');
        charger();
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={COLORS.or} />
    </View>
  );

  const estVendeur    = enchere?.vendeur_id === user?.id;
  const estEnCours    = enchere?.statut === 'en_cours';
  const estGagnant    = enchere?.meilleur_offrant_id === user?.id;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* IMAGE + TIMER */}
        <View style={styles.img}>
          <Text style={styles.imgEmoji}>📦</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backTxt}>← Retour</Text>
          </TouchableOpacity>
          {estEnCours && (
            <View style={styles.liveTag}>
              <Text style={styles.liveTxt}>🔴 EN DIRECT</Text>
            </View>
          )}
          {connected && (
            <View style={styles.connectedTag}>
              <Text style={styles.connectedTxt}>⚡ Temps réel</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* TITRE */}
          <Text style={styles.titre}>{enchere?.titre}</Text>
          <Text style={styles.loc}>📍 {enchere?.quartier}, {enchere?.ville}</Text>
          <Text style={styles.cat}>📦 {enchere?.categorie}</Text>

          {/* TIMER */}
          {estEnCours && temps && (
            <View style={[styles.timerBox, temps.urgent && styles.timerBoxUrgent]}>
              <Text style={styles.timerLabel}>Temps restant</Text>
              <Text style={[styles.timerTxt, temps.urgent && styles.timerTxtUrgent]}>
                ⏱ {temps.texte}
              </Text>
            </View>
          )}

          {/* PRIX EN DIRECT */}
          <Animated.View style={[styles.prixBox, { transform: [{ scale: pulseAnim }] }]}>
            <View>
              <Text style={styles.prixLabel}>Offre actuelle</Text>
              <Text style={styles.prix}>{enchere?.offre_actuelle?.toLocaleString()} FCFA</Text>
              <Text style={styles.nbOffres}>🙋 {enchere?.nb_offres} enchères</Text>
            </View>
            {estGagnant && estEnCours && (
              <View style={styles.gagnantBadge}>
                <Text style={styles.gagnantTxt}>🏆 Vous menez !</Text>
              </View>
            )}
          </Animated.View>

          {/* DESCRIPTION */}
          {enchere?.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitre}>Description</Text>
              <Text style={styles.desc}>{enchere?.description}</Text>
            </View>
          )}

          {/* VENDEUR */}
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Vendeur</Text>
            <View style={styles.vendeurRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{enchere?.prenom?.[0]}{enchere?.nom?.[0]}</Text>
              </View>
              <View>
                <Text style={styles.vendeurNom}>{enchere?.prenom} {enchere?.nom}</Text>
                <Text style={styles.vendeurNote}>⭐ {enchere?.note_moyenne}</Text>
              </View>
            </View>
          </View>

          {/* HISTORIQUE OFFRES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Historique des offres</Text>
            {offres.length === 0
              ? <Text style={styles.videOffres}>Aucune offre pour le moment. Soyez le premier !</Text>
              : offres.map((o, i) => (
                <View key={i} style={[styles.offreRow, i === 0 && styles.offreRowFirst]}>
                  <View style={styles.offreAvatar}>
                    <Text style={styles.offreAvatarTxt}>{o.prenom?.[0]}{o.nom?.[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offreNom}>{o.prenom} {o.nom}</Text>
                    <Text style={styles.offreDate}>{new Date(o.cree_le).toLocaleTimeString('fr-SN')}</Text>
                  </View>
                  <Text style={[styles.offreMontant, i === 0 && styles.offreMontantFirst]}>
                    {o.montant?.toLocaleString()} FCFA
                  </Text>
                </View>
              ))
            }
          </View>
        </View>
      </ScrollView>

      {/* BOUTON ENCHÉRIR */}
      {!estVendeur && estEnCours && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnEncherir} onPress={() => {
            setMontant(String(enchere.offre_actuelle + 1000));
            setShowModal(true);
          }}>
            <Text style={styles.btnEncherirTxt}>🔨 Placer une offre</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL OFFRE */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitre}>Placer une off
cat > src/navigation/index.js << 'EOF'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import SplashScreen       from '../screens/auth/SplashScreen';
import ConnexionScreen    from '../screens/auth/ConnexionScreen';
import InscriptionScreen  from '../screens/auth/InscriptionScreen';

// App Screens
import AccueilScreen        from '../screens/dons/AccueilScreen';
import DonsScreen           from '../screens/dons/DonsScreen';
import DetailDonScreen      from '../screens/dons/DetailDonScreen';
import EncheresScreen       from '../screens/encheres/EncheresScreen';
import DetailEnchereScreen  from '../screens/encheres/DetailEnchereScreen';
import ProfilScreen         from '../screens/profil/ProfilScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', light: '#B0A090',
};

// Stack Dons
const DonsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListeDons" component={DonsScreen} />
    <Stack.Screen name="DetailDon" component={DetailDonScreen} />
  </Stack.Navigator>
);

// Stack Accueil
const AccueilStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Accueil"   component={AccueilScreen} />
    <Stack.Screen name="DetailDon" component={DetailDonScreen} />
    <Stack.Screen name="DetailEnchere" component={DetailEnchereScreen} />
  </Stack.Navigator>
);

// Stack Enchères
const EncheresStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListeEncheres"  component={EncheresScreen} />
    <Stack.Screen name="DetailEnchere"  component={DetailEnchereScreen} />
  </Stack.Navigator>
);

// Navigation principale
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
    <Tab.Screen name="Enchères"  component={EncheresStack} />
    <Tab.Screen name="Profil"    component={ProfilScreen} />
  </Tab.Navigator>
);

// Navigation auth
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
