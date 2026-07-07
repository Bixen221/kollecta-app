import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal
} from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ImageViewer from '../../components/ImageViewer';

export default function DetailDonScreen({ route, navigation }) {
  const { donId } = route.params;
  const { user }  = useAuth();
  const { theme } = useTheme();
  const [don,         setDon]         = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [reserving,   setReserving]   = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [dejaReserve, setDejaReserve] = useState(false);

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      const res = await api.get('/dons/'+donId);
      setDon(res.don);
      if (user) {
        try {
          const resResas = await api.get('/dons/reservations/mes-reservations');
          const dejaFait = resResas.reservations?.some(
            r => r.don_id === donId && !['annule'].includes(r.statut)
          );
          setDejaReserve(dejaFait);
        } catch (e) {}
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleReserver = async () => {
    setReserving(true);
    try {
      await api.post('/dons/'+donId+'/reserver');
      setDejaReserve(true);
      setShowModal(false);
      Alert.alert('✅ Réservation confirmée !', 'Le propriétaire vous contactera sur WhatsApp dans les 48h.', [{ text: 'OK' }]);
      charger();
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setReserving(false);
    }
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
      <ActivityIndicator size="large" color={theme.or} />
    </View>
  );

  const estProprio = don?.proprietaire_id === user?.id;
  const plusDispo  = don?.quantite_dispo <= 0;
  const pourcent   = don ? Math.round((1 - don.quantite_dispo / don.quantite_total) * 100) : 0;
  const photos     = don?.photos?.filter(Boolean) || [];

  const getBoutonEtat = () => {
    if (estProprio)  return { label: 'Votre annonce',   disabled: true,  bg: theme.txt3 };
    if (dejaReserve) return { label: '✓ Déjà réservé',  disabled: true,  bg: theme.gr };
    if (plusDispo)   return { label: 'Plus disponible', disabled: true,  bg: theme.txt3 };
    return { label: 'Réserver ce don', disabled: false, bg: theme.bord };
  };

  const bouton = getBoutonEtat();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView>
        {/* IMAGE */}
        <View style={{ height: 260, position: 'relative' }}>
          <ImageViewer
            photos={photos}
            style={{ width: '100%', height: '100%', backgroundColor: don?.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }}
            defaultEmoji={don?.type === 'nourriture' ? '🍱' : '📦'}
          />
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>← Retour</Text>
          </TouchableOpacity>
          {dejaReserve && (
            <View style={{ position: 'absolute', bottom: 12, right: 16, backgroundColor: 'rgba(45,122,79,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>✓ Réservé par vous</Text>
            </View>
          )}
        </View>

        <View style={{ padding: 20 }}>
          {/* TAGS */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <View style={{ backgroundColor: theme.orl, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: theme.or }}>{don?.categorie || don?.type}</Text>
            </View>
            {don?.urgent && (
              <View style={{ backgroundColor: '#FFECEC', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#CC2222' }}>🚨 Urgent</Text>
              </View>
            )}
            {dejaReserve && (
              <View style={{ backgroundColor: theme.grl, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: theme.gr }}>✓ Réservé</Text>
              </View>
            )}
          </View>

          <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt, marginBottom: 6 }}>{don?.titre}</Text>
          <Text style={{ fontSize: 13, color: theme.txt2, marginBottom: 16 }}>📍 {don?.quartier}, {don?.ville}</Text>

          {/* INFO RESERVATION */}
          {dejaReserve && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: theme.grl, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: theme.gr }}>
              <Text style={{ fontSize: 20 }}>⏳</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.gr, marginBottom: 3 }}>Réservation en cours</Text>
                <Text style={{ fontSize: 12, color: theme.txt2, lineHeight: 18 }}>Le propriétaire vous contactera sur WhatsApp dans les 48h.</Text>
              </View>
            </View>
          )}

          {/* DESCRIPTION */}
          {don?.description && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Description</Text>
              <Text style={{ fontSize: 14, color: theme.txt, lineHeight: 22 }}>{don?.description}</Text>
            </View>
          )}

          {/* DISPONIBILITE */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Disponibilité</Text>
            <View style={{ height: 6, backgroundColor: theme.bd, borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
              <View style={{ width: pourcent+'%', height: '100%', backgroundColor: theme.gr, borderRadius: 10 }} />
            </View>
            <Text style={{ fontSize: 12, color: theme.txt2 }}>{don?.quantite_dispo}/{don?.quantite_total} disponibles</Text>
          </View>

          {/* PROPRIETAIRE */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Propriétaire</Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              onPress={() => navigation.navigate('ProfilPublic', { userId: don?.proprietaire_id, nom: don?.nom, prenom: don?.prenom })}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.bord, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>{don?.prenom?.[0]}{don?.nom?.[0]}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: theme.txt }}>{don?.prenom} {don?.nom}</Text>
                <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 2 }}>⭐ {don?.note_moyenne} · {don?.nb_dons} dons</Text>
              </View>
              <Text style={{ fontSize: 16, color: theme.txt3, marginLeft: 'auto' }}>›</Text>
            </TouchableOpacity>
          </View>

          {/* ACTIONS PROPRIO */}
          {estProprio && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: theme.card2, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.bd }}>
                <Text style={{ color: theme.or, fontWeight: '700' }}>✏️ Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#3A1A1A', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FF6B6B' }}
                onPress={() => Alert.alert('Supprimer', 'Voulez-vous supprimer ce don ?', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: async () => {
                    await api.delete('/dons/'+donId);
                    navigation.goBack();
                  }},
                ])}
              >
                <Text style={{ color: '#FF6B6B', fontWeight: '700' }}>🗑️ Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOUTON BAS */}
      {!estProprio && (
        <View style={{ padding: 16, paddingBottom: 32, backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.bd }}>
          <TouchableOpacity
            style={{ borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: bouton.bg, opacity: bouton.disabled ? 0.8 : 1 }}
            onPress={() => !bouton.disabled && setShowModal(true)}
            disabled={bouton.disabled}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: 'white' }}>{bouton.label}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.card, borderRadius: 24, padding: 20, paddingBottom: 36 }}>
            <View style={{ width: 36, height: 4, backgroundColor: theme.bd, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.txt, marginBottom: 8 }}>Confirmer la réservation</Text>
            <Text style={{ fontSize: 13, color: theme.txt2, marginBottom: 16, lineHeight: 20 }}>
              Le propriétaire sera notifié et vous contactera sur WhatsApp dans les <Text style={{ color: theme.or, fontWeight: '700' }}>48h</Text>.
            </Text>
            <View style={{ backgroundColor: theme.card2, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: theme.bd }}>
              <Text style={{ fontSize: 14, color: theme.txt, marginBottom: 4 }}>{don?.type === 'nourriture' ? '🍱' : '📦'} <Text style={{ fontWeight: '700' }}>{don?.titre}</Text></Text>
              <Text style={{ fontSize: 12, color: theme.txt2 }}>{don?.prenom} {don?.nom} · {don?.quartier}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: theme.card2, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.bd }}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.txt2 }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 2, backgroundColor: theme.bord, borderRadius: 12, padding: 14, alignItems: 'center' }}
                onPress={handleReserver}
                disabled={reserving}
              >
                {reserving
                  ? <ActivityIndicator color="white" />
                  : <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>✓ Confirmer</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
