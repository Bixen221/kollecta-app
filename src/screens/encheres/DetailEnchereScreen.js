import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput, Animated,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import ImageViewer from '../../components/ImageViewer';

const API_URL = 'https://kollecta-backend.onrender.com';

const getTempsRestant = (fin_le) => {
  const diff = new Date(fin_le) - new Date();
  if (diff <= 0) return { texte: 'Terminee', urgent: false };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 24) return { texte: Math.floor(h/24)+'j '+h%24+'h', urgent: false };
  if (h > 1)  return { texte: h+'h '+m+'m', urgent: false };
  return { texte: h+'h '+m+'m '+s+'s', urgent: true };
};

export default function DetailEnchereScreen({ route, navigation }) {
  const { enchereId } = route.params;
  const { user }      = useAuth();
  const { theme }     = useTheme();
  const [enchere,   setEnchere]   = useState(null);
  const [offres,    setOffres]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [montant,   setMontant]   = useState('');
  const [placing,   setPlacing]   = useState(false);
  const [temps,     setTemps]     = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    charger();
    connecterSocket();
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, []);

  useEffect(() => {
    if (!enchere) return;
    const interval = setInterval(() => setTemps(getTempsRestant(enchere.fin_le)), 1000);
    return () => clearInterval(interval);
  }, [enchere]);

  const animerPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 200, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const charger = async () => {
    try {
      const res = await api.get('/encheres/'+enchereId);
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
      const socket = io(API_URL, { auth: { token }, transports: ['websocket'] });
      socket.on('connect', () => { setConnected(true); socket.emit('rejoindre_enchere', enchereId); });
      socket.on('disconnect', () => setConnected(false));
      socket.on('nouvelle_offre', (data) => {
        setEnchere(prev => ({ ...prev, offre_actuelle: data.montant, meilleur_offrant_id: data.offreur.id, nb_offres: (prev.nb_offres || 0) + 1 }));
        setOffres(prev => [{ ...data, nom: data.offreur.nom, prenom: data.offreur.prenom }, ...prev]);
        animerPulse();
      });
      socket.on('erreur_offre', (data) => { Alert.alert('Erreur', data.message); setPlacing(false); });
      socketRef.current = socket;
    } catch (err) { console.error('Socket error:', err); }
  };

  const handlePlacerOffre = async () => {
    const montantNum = parseInt(montant);
    if (!montantNum || montantNum <= enchere.offre_actuelle) {
      return Alert.alert('Erreur', "L'offre doit etre superieure a "+enchere.offre_actuelle?.toLocaleString()+" FCFA");
    }
    setPlacing(true);
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('placer_offre', { enchere_id: enchereId, montant: montantNum });
        setShowModal(false); setMontant(''); setPlacing(false);
      } else {
        await api.post('/encheres/'+enchereId+'/offrir', { montant: montantNum });
        setShowModal(false); setMontant(''); charger();
      }
    } catch (err) { Alert.alert('Erreur', err.message); }
    finally { setPlacing(false); }
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
      <ActivityIndicator size="large" color={theme.or} />
    </View>
  );

  const estVendeur = enchere?.vendeur_id === user?.id;
  const estEnCours = enchere?.statut === 'en_cours';
  const estGagnant = enchere?.meilleur_offrant_id === user?.id;
  const photos     = enchere?.photos?.filter(Boolean) || [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView>
        {/* IMAGE */}
        <View style={{ height: 260, position: 'relative' }}>
          <ImageViewer photos={photos} style={{ width: '100%', height: '100%', backgroundColor: theme.card2 }} defaultEmoji="📦" />
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>← Retour</Text>
          </TouchableOpacity>
          {estEnCours && (
            <View style={{ position: 'absolute', top: 50, right: 16, backgroundColor: theme.bord, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>🔴 EN DIRECT</Text>
            </View>
          )}
          {connected && (
            <View style={{ position: 'absolute', bottom: 12, right: 16, backgroundColor: 'rgba(45,122,79,0.8)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>⚡ Temps réel</Text>
            </View>
          )}
        </View>

        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt, marginBottom: 6 }}>{enchere?.titre}</Text>
          <Text style={{ fontSize: 13, color: theme.txt2, marginBottom: 16 }}>📍 {enchere?.quartier}, {enchere?.ville}</Text>

          {/* TIMER */}
          {estEnCours && temps && (
            <View style={{ backgroundColor: temps.urgent ? 'rgba(204,34,34,0.12)' : theme.card2, borderRadius: 14, padding: 16, marginBottom: 14, alignItems: 'center', borderWidth: 1, borderColor: temps.urgent ? theme.bord : theme.bd }}>
              <Text style={{ fontSize: 11, color: theme.txt2, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 }}>Temps restant</Text>
              <Text style={{ fontSize: 28, fontWeight: '800', color: temps.urgent ? '#FF4444' : theme.or }}>⏱ {temps.texte}</Text>
            </View>
          )}

          {/* PRIX */}
          <Animated.View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 18, marginBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: theme.bd, transform: [{ scale: pulseAnim }] }}>
            <View>
              <Text style={{ fontSize: 11, color: theme.txt2, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Offre actuelle</Text>
              <Text style={{ fontSize: 28, fontWeight: '800', color: theme.bord }}>{enchere?.offre_actuelle?.toLocaleString()} FCFA</Text>
              <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 4 }}>🙋 {enchere?.nb_offres} enchères</Text>
            </View>
            {estGagnant && estEnCours && (
              <View style={{ backgroundColor: theme.orl, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: theme.or }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.or }}>🏆 Vous menez !</Text>
              </View>
            )}
          </Animated.View>

          {/* DESCRIPTION */}
          {enchere?.description && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Description</Text>
              <Text style={{ fontSize: 14, color: theme.txt, lineHeight: 22 }}>{enchere?.description}</Text>
            </View>
          )}

          {/* VENDEUR */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Vendeur</Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              onPress={() => navigation.navigate('ProfilPublic', { userId: enchere?.vendeur_id, nom: enchere?.nom, prenom: enchere?.prenom })}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.bord, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>{enchere?.prenom?.[0]}{enchere?.nom?.[0]}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: theme.txt }}>{enchere?.prenom} {enchere?.nom}</Text>
                <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 2 }}>⭐ {enchere?.note_moyenne}</Text>
              </View>
              <Text style={{ fontSize: 16, color: theme.txt3, marginLeft: 'auto' }}>›</Text>
            </TouchableOpacity>
          </View>

          {/* HISTORIQUE */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Historique des offres</Text>
            {offres.length === 0
              ? <Text style={{ fontSize: 13, color: theme.txt2, textAlign: 'center', padding: 16 }}>Aucune offre. Soyez le premier !</Text>
              : offres.map((o, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, marginBottom: 6, backgroundColor: i === 0 ? theme.orl : theme.card2, borderWidth: i === 0 ? 1 : 0, borderColor: theme.or }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: theme.or }}>{o.prenom?.[0]}{o.nom?.[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: theme.txt }}>{o.prenom} {o.nom}</Text>
                    <Text style={{ fontSize: 11, color: theme.txt2 }}>{new Date(o.cree_le).toLocaleTimeString('fr-SN')}</Text>
                  </View>
                  <Text style={{ fontSize: i === 0 ? 16 : 14, fontWeight: '700', color: i === 0 ? theme.or : theme.txt2 }}>
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
        <View style={{ padding: 16, paddingBottom: 32, backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.bd }}>
          <TouchableOpacity
            style={{ backgroundColor: theme.bord, borderRadius: 14, padding: 16, alignItems: 'center' }}
            onPress={() => { setMontant(String(enchere.offre_actuelle + 1000)); setShowModal(true); }}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: 'white' }}>🔨 Placer une offre</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL OFFRE */}
      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowModal(false)} />
          <View style={{ backgroundColor: theme.card, borderRadius: 24, padding: 20, paddingBottom: 36 }}>
            <View style={{ width: 36, height: 4, backgroundColor: theme.bd, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.txt, marginBottom: 6 }}>Placer une offre</Text>
            <Text style={{ fontSize: 13, color: theme.txt2, marginBottom: 16 }}>
              Offre actuelle : <Text style={{ color: theme.or, fontWeight: '700' }}>{enchere?.offre_actuelle?.toLocaleString()} FCFA</Text>
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 }}>
              <TextInput
                style={{ flex: 1, fontSize: 22, fontWeight: '800', color: theme.or }}
                value={montant}
                onChangeText={setMontant}
                keyboardType="number-pad"
                placeholder="Montant"
                placeholderTextColor={theme.txt3}
                autoFocus
              />
              <Text style={{ fontSize: 14, color: theme.txt2, fontWeight: '600' }}>FCFA</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: theme.card2, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.bd }} onPress={() => setShowModal(false)}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.txt2 }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 2, backgroundColor: theme.bord, borderRadius: 12, padding: 14, alignItems: 'center' }} onPress={handlePlacerOffre} disabled={placing}>
                {placing ? <ActivityIndicator color="white" /> : <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>🔨 Enchérir</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
