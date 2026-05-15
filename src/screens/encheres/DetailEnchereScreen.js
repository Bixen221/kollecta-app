import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, TextInput, Animated,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', dark2: '#1A120E',
  light: '#B0A090', bd: 'rgba(201,168,76,0.2)',
};

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
  const { user } = useAuth();
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
    const interval = setInterval(() => {
      setTemps(getTempsRestant(enchere.fin_le));
    }, 1000);
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
      return Alert.alert('Erreur', "L'offre doit etre superieure a "+enchere.offre_actuelle?.toLocaleString()+" FCFA");
    }
    setPlacing(true);
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('placer_offre', { enchere_id: enchereId, montant: montantNum });
        setShowModal(false);
        setMontant('');
        setPlacing(false);
      } else {
        await api.post('/encheres/'+enchereId+'/offrir', { montant: montantNum });
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

  const estVendeur = enchere?.vendeur_id === user?.id;
  const estEnCours = enchere?.statut === 'en_cours';
  const estGagnant = enchere?.meilleur_offrant_id === user?.id;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.img}>
          <Text style={styles.imgEmoji}>📦</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backTxt}>← Retour</Text>
          </TouchableOpacity>
          {estEnCours && <View style={styles.liveTag}><Text style={styles.liveTxt}>🔴 EN DIRECT</Text></View>}
          {connected && <View style={styles.connectedTag}><Text style={styles.connectedTxt}>⚡ Temps reel</Text></View>}
        </View>

        <View style={styles.body}>
          <Text style={styles.titre}>{enchere?.titre}</Text>
          <Text style={styles.loc}>📍 {enchere?.quartier}, {enchere?.ville}</Text>

          {estEnCours && temps && (
            <View style={[styles.timerBox, temps.urgent && styles.timerBoxUrgent]}>
              <Text style={styles.timerLabel}>Temps restant</Text>
              <Text style={[styles.timerTxt, temps.urgent && styles.timerTxtUrgent]}>⏱ {temps.texte}</Text>
            </View>
          )}

          <Animated.View style={[styles.prixBox, { transform: [{ scale: pulseAnim }] }]}>
            <View>
              <Text style={styles.prixLabel}>Offre actuelle</Text>
              <Text style={styles.prix}>{enchere?.offre_actuelle?.toLocaleString()} FCFA</Text>
              <Text style={styles.nbOffres}>🙋 {enchere?.nb_offres} encheres</Text>
            </View>
            {estGagnant && estEnCours && (
              <View style={styles.gagnantBadge}>
                <Text style={styles.gagnantTxt}>🏆 Vous menez !</Text>
              </View>
            )}
          </Animated.View>

          {enchere?.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitre}>Description</Text>
              <Text style={styles.desc}>{enchere?.description}</Text>
            </View>
          )}

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

          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Historique des offres</Text>
            {offres.length === 0
              ? <Text style={styles.videOffres}>Aucune offre. Soyez le premier !</Text>
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

      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitre}>Placer une offre</Text>
            <Text style={styles.modalSous}>
              Offre actuelle : <Text style={{ color: COLORS.or, fontWeight: '700' }}>{enchere?.offre_actuelle?.toLocaleString()} FCFA</Text>
            </Text>
            <View style={styles.montantInput}>
              <TextInput
                style={styles.montantField}
                value={montant}
                onChangeText={setMontant}
                keyboardType="number-pad"
                placeholder="Montant en FCFA"
                placeholderTextColor={COLORS.light}
                autoFocus
              />
              <Text style={styles.montantSuffix}>FCFA</Text>
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.modalBtnCancelTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={handlePlacerOffre} disabled={placing}>
                {placing ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnConfirmTxt}>🔨 Enchérir</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#0E0A08' },
  loading:           { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0E0A08' },
  img:               { height: 220, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2A1E18', position: 'relative' },
  imgEmoji:          { fontSize: 70 },
  backBtn:           { position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  backTxt:           { color: 'white', fontSize: 13, fontWeight: '700' },
  liveTag:           { position: 'absolute', top: 50, right: 16, backgroundColor: COLORS.bord, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  liveTxt:           { color: 'white', fontSize: 11, fontWeight: '700' },
  connectedTag:      { position: 'absolute', bottom: 12, right: 16, backgroundColor: 'rgba(45,122,79,0.8)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  connectedTxt:      { color: 'white', fontSize: 10, fontWeight: '700' },
  body:              { padding: 20 },
  titre:             { fontSize: 22, fontWeight: '800', color: '#F0E8D8', marginBottom: 6 },
  loc:               { fontSize: 13, color: COLORS.light, marginBottom: 16 },
  timerBox:          { backgroundColor: '#1A120E', borderRadius: 14, padding: 16, marginBottom: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bd },
  timerBoxUrgent:    { borderColor: COLORS.bord, backgroundColor: '#2A0A0A' },
  timerLabel:        { fontSize: 11, color: COLORS.light, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  timerTxt:          { fontSize: 28, fontWeight: '800', color: COLORS.or },
  timerTxtUrgent:    { color: '#FF4444' },
  prixBox:           { backgroundColor: '#1E1612', borderRadius: 16, padding: 18, marginBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.bd },
  prixLabel:         { fontSize: 11, color: COLORS.light, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  prix:              { fontSize: 28, fontWeight: '800', color: COLORS.bord },
  nbOffres:          { fontSize: 12, color: COLORS.light, marginTop: 4 },
  gagnantBadge:      { backgroundColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.or },
  gagnantTxt:        { fontSize: 12, fontWeight: '700', color: COLORS.or },
  section:           { marginBottom: 20 },
  sectionTitre:      { fontSize: 12, fontWeight: '700', color: COLORS.light, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  desc:              { fontSize: 14, color: '#F0E8D8', lineHeight: 22 },
  vendeurRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:            { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bord, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:         { fontSize: 16, fontWeight: '700', color: 'white' },
  vendeurNom:        { fontSize: 15, fontWeight: '700', color: '#F0E8D8' },
  vendeurNote:       { fontSize: 12, color: COLORS.light, marginTop: 2 },
  videOffres:        { fontSize: 13, color: COLORS.light, textAlign: 'center', padding: 16 },
  offreRow:          { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, marginBottom: 6, backgroundColor: '#1A120E' },
  offreRowFirst:     { backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: COLORS.or },
  offreAvatar:       { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2A1E18', justifyContent: 'center', alignItems: 'center' },
  offreAvatarTxt:    { fontSize: 11, fontWeight: '700', color: COLORS.or },
  offreNom:          { fontSize: 13, fontWeight: '600', color: '#F0E8D8' },
  offreDate:         { fontSize: 11, color: COLORS.light },
  offreMontant:      { fontSize: 14, fontWeight: '700', color: COLORS.light },
  offreMontantFirst: { color: COLORS.or, fontSize: 16 },
  footer:            { padding: 16, paddingBottom: 32, backgroundColor: '#0E0A08', borderTopWidth: 1, borderTopColor: COLORS.bd },
  btnEncherir:       { backgroundColor: COLORS.bord, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnEncherirTxt:    { fontSize: 16, fontWeight: '800', color: 'white' },
  modalSheet:        { backgroundColor: '#1E1612', borderRadius: 24, padding: 20, paddingBottom: 36 },
  modalHandle:       { width: 36, height: 4, backgroundColor: COLORS.bd, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitre:        { fontSize: 18, fontWeight: '800', color: '#F0E8D8', marginBottom: 6 },
  modalSous:         { fontSize: 13, color: COLORS.light, marginBottom: 16 },
  montantInput:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0E0A08', borderWidth: 1, borderColor: COLORS.bd, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  montantField:      { flex: 1, fontSize: 22, fontWeight: '800', color: COLORS.or },
  montantSuffix:     { fontSize: 14, color: COLORS.light, fontWeight: '600' },
  modalBtns:         { flexDirection: 'row', gap: 10 },
  modalBtnCancel:    { flex: 1, backgroundColor: '#2A1E18', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bd },
  modalBtnCancelTxt: { fontSize: 14, fontWeight: '700', color: COLORS.light },
  modalBtnConfirm:   { flex: 2, backgroundColor: COLORS.bord, borderRadius: 12, padding: 14, alignItems: 'center' },
  modalBtnConfirmTxt:{ fontSize: 14, fontWeight: '700', color: 'white' },
});
