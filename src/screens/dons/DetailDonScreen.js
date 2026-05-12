import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { genererLienWhatsApp } from '../../utils/helpers';
import { Linking } from 'react-native';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', dark2: '#1A120E',
  light: '#B0A090', bd: 'rgba(201,168,76,0.2)', gr: '#2D7A4F',
};

export default function DetailDonScreen({ route, navigation }) {
  const { donId } = route.params;
  const { user }  = useAuth();
  const [don,        setDon]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [reserving,  setReserving]  = useState(false);
  const [showModal,  setShowModal]  = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    try {
      const res = await api.get(`/dons/${donId}`);
      setDon(res.don);
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
      await api.post(`/dons/${donId}/reserver`);
      setShowModal(false);
      Alert.alert(
        '✅ Réservation confirmée !',
        'Le propriétaire recevra une notification et vous contactera sur WhatsApp dans les 48h.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setReserving(false);
    }
  };

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={COLORS.or} />
    </View>
  );

  const estProprio = don?.proprietaire_id === user?.id;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* IMAGE */}
        <View style={[styles.img, { backgroundColor: don?.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }]}>
          <Text style={styles.imgEmoji}>{don?.type === 'nourriture' ? '🍱' : '📦'}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backTxt}>← Retour</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* TAGS */}
          <View style={styles.tagRow}>
            <View style={styles.tag}><Text style={styles.tagTxt}>{don?.categorie || don?.type}</Text></View>
            {don?.urgent && <View style={[styles.tag, { backgroundColor: '#FFECEC' }]}><Text style={[styles.tagTxt, { color: '#CC2222' }]}>🚨 Urgent</Text></View>}
          </View>

          {/* TITRE */}
          <Text style={styles.titre}>{don?.titre}</Text>
          <Text style={styles.loc}>📍 {don?.quartier}, {don?.ville}</Text>

          {/* DESCRIPTION */}
          {don?.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitre}>Description</Text>
              <Text style={styles.desc}>{don?.description}</Text>
            </View>
          )}

          {/* DISPONIBILITE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Disponibilité</Text>
            <View style={styles.dispoRow}>
              <View style={styles.dispoBar}>
                <View style={[styles.dispoFill, { width: `${(1 - don?.quantite_dispo / don?.quantite_total) * 100}%` }]} />
              </View>
              <Text style={styles.dispoTxt}>{don?.quantite_dispo}/{don?.quantite_total} disponibles</Text>
            </View>
          </View>

          {/* PROPRIETAIRE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Propriétaire</Text>
            <View style={styles.propRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{don?.prenom?.[0]}{don?.nom?.[0]}</Text>
              </View>
              <View>
                <Text style={styles.propNom}>{don?.prenom} {don?.nom}</Text>
                <Text style={styles.propNote}>⭐ {don?.note_moyenne} · {don?.nb_dons} dons</Text>
              </View>
            </View>
          </View>

          {/* ACTIONS PROPRIO */}
          {estProprio && (
            <View style={styles.propActions}>
              <TouchableOpacity style={styles.btnEdit}>
                <Text style={styles.btnEditTxt}>✏️ Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDel} onPress={() => Alert.alert('Supprimer', 'Voulez-vous supprimer ce don ?', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: async () => {
                  await api.delete(`/dons/${donId}`);
                  navigation.goBack();
                }},
              ])}>
                <Text style={styles.btnDelTxt}>🗑️ Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOUTON RESERVER */}
      {!estProprio && don?.quantite_dispo > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnReserver} onPress={() => setShowModal(true)}>
            <Text style={styles.btnReserverTxt}>Réserver ce don</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL CONFIRMATION */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitre}>Confirmer la réservation</Text>
            <Text style={styles.modalSous}>
              Le propriétaire recevra une notification et vous contactera sur WhatsApp dans les <Text style={{ color: COLORS.or, fontWeight: '700' }}>48h</Text>.
            </Text>
            <View style={styles.modalDon}>
              <Text style={styles.modalDonTxt}>{don?.type === 'nourriture' ? '🍱' : '📦'} <Text style={{ fontWeight: '700' }}>{don?.titre}</Text></Text>
              <Text style={styles.modalDonSous}>{don?.prenom} {don?.nom} · {don?.quartier}</Text>
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.modalBtnCancelTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleReserver} disabled={reserving}>
                {reserving
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.modalBtnConfirmTxt}>✓ Confirmer</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0E0A08' },
  loading:          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0E0A08' },
  img:              { height: 220, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  imgEmoji:         { fontSize: 60 },
  backBtn:          { position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  backTxt:          { color: 'white', fontSize: 13, fontWeight: '700' },
  body:             { padding: 20 },
  tagRow:           { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tag:              { backgroundColor: '#FFF8E8', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  tagTxt:           { fontSize: 11, fontWeight: '600', color: '#7A4F00' },
  titre:            { fontSize: 22, fontWeight: '800', color: '#F0E8D8', marginBottom: 6 },
  loc:              { fontSize: 13, color: COLORS.light, marginBottom: 20 },
  section:          { marginBottom: 20 },
  sectionTitre:     { fontSize: 12, fontWeight: '700', color: COLORS.light, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  desc:             { fontSize: 14, color: '#F0E8D8', lineHeight: 22 },
  dispoRow:         { gap: 8 },
  dispoBar:         { height: 6, backgroundColor: COLORS.bd, borderRadius: 10, overflow: 'hidden' },
  dispoFill:        { height: '100%', backgroundColor: COLORS.gr, borderRadius: 10 },
  dispoTxt:         { fontSize: 12, color: COLORS.light },
  propRow:          { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:           { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bord, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:        { fontSize: 16, fontWeight: '700', color: 'white' },
  propNom:          { fontSize: 15, fontWeight: '700', color: '#F0E8D8' },
  propNote:         { fontSize: 12, color: COLORS.light, marginTop: 2 },
  propActions:      { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnEdit:          { flex: 1, backgroundColor: '#1E3A5F', borderRadius: 10, padding: 12, alignItems: 'center' },
  btnEditTxt:       { color: '#6DB8FF', fontWeight: '700' },
  btnDel:           { flex: 1, backgroundColor: '#3A1A1A', borderRadius: 10, padding: 12, alignItems: 'center' },
  btnDelTxt:        { color: '#FF6B6B', fontWeight: '700' },
  footer:           { padding: 16, paddingBottom: 32, backgroundColor: '#0E0A08', borderTopWidth: 1, borderTopColor: COLORS.bd },
  btnReserver:      { backgroundColor: COLORS.bord, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnReserverTxt:   { fontSize: 16, fontWeight: '800', color: 'white' },
  modalBg:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet:       { backgroundColor: '#1E1612', borderRadius: 24, padding: 20, paddingBottom: 36 },
  modalHandle:      { width: 36, height: 4, backgroundColor: COLORS.bd, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitre:       { fontSize: 18, fontWeight: '800', color: '#F0E8D8', marginBottom: 8 },
  modalSous:        { fontSize: 13, color: COLORS.light, marginBottom: 16, lineHeight: 20 },
  modalDon:         { backgroundColor: '#2A1E18', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.bd },
  modalDonTxt:      { fontSize: 14, color: '#F0E8D8', marginBottom: 4 },
  modalDonSous:     { fontSize: 12, color: COLORS.light },
  modalBtns:        { flexDirection: 'row', gap: 10 },
  modalBtnCancel:   { flex: 1, backgroundColor: '#2A1E18', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bd },
  modalBtnCancelTxt:{ fontSize: 14, fontWeight: '700', color: COLORS.light },
  modalBtnConfirm:  { flex: 2, backgroundColor: COLORS.bord, borderRadius: 12, padding: 14, alignItems: 'center' },
  modalBtnConfirmTxt:{ fontSize: 14, fontWeight: '700', color: 'white' },
});
