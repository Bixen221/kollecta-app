import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image } from 'react-native';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useReservations } from '../../context/ReservationsContext';
import EvaluationModal from '../../components/EvaluationModal';

export default function MesReservationsScreen({ navigation }) {
  const { theme }  = useTheme();
  const { charger: rechargerResas } = useReservations();
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [onglet,       setOnglet]       = useState('en_cours');
  const [evalModal,    setEvalModal]    = useState(null);
  const [dejaEvalues,  setDejaEvalues]  = useState({});

  const charger = async () => {
    try {
      const res = await api.get('/dons/reservations/mes-reservations');
      const resas = res.reservations || [];
      setReservations(resas);

      // Vérifier quels dons clôturés ont déjà été évalués
      const clotures = resas.filter(r => r.statut === 'cloture');
      const evals = {};
      for (const r of clotures) {
        try {
          const check = await api.get('/evaluations/don/'+r.don_id);
          evals[r.don_id] = check.dejaEvalue;
        } catch (e) {}
      }
      setDejaEvalues(evals);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { charger(); }, []);

  const enCours  = reservations.filter(r => !['cloture', 'annule'].includes(r.statut));
  const termines = reservations.filter(r => r.statut === 'cloture');
  const annules  = reservations.filter(r => r.statut === 'annule');

  const getStatutLabel = (statut) => {
    const map = {
      en_attente:         { label: '⏳ En attente',         color: theme.or },
      contacte:           { label: '📱 Contacté',           color: '#4ADE80' },
      confirme_proprio:   { label: '✅ Proprio a confirmé', color: '#4ADE80' },
      confirme_demandeur: { label: '✅ Vous avez confirmé', color: '#4ADE80' },
      cloture:            { label: '🎉 Don reçu',           color: theme.gr },
      annule:             { label: '❌ Annulé',             color: '#FF6B6B' },
    };
    return map[statut] || { label: statut, color: theme.txt2 };
  };

  const handleAnnuler = (resa) => {
    Alert.alert('Annuler la réservation ?', 'Voulez-vous vraiment annuler ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: async () => {
        try {
          await api.post('/dons/reservations/'+resa.id+'/confirmer', { role: 'annuler' });
          await rechargerResas();
          charger();
        } catch (err) { Alert.alert('Erreur', err.message); }
      }},
    ]);
  };

  const handleConfirmer = async (resa) => {
    try {
      await api.post('/dons/reservations/'+resa.id+'/confirmer', { role: 'demandeur' });
      charger();
      Alert.alert('✅ Merci !', 'Le don a été confirmé et clôturé.');
    } catch (err) { Alert.alert('Erreur', err.message); }
  };

  const ResaCard = ({ resa }) => {
    const statut = getStatutLabel(resa.statut);
    const besoinConfirmation = ['confirme_proprio'].includes(resa.statut);
    const peutEvaluer = resa.statut === 'cloture' && !dejaEvalues[resa.don_id];

    return (
      <TouchableOpacity
        style={{ backgroundColor: theme.card, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: theme.bd }}
        onPress={() => navigation.navigate('DetailDon', { donId: resa.don_id })}
      >
        <View style={{ height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.card2 }}>
          {resa.photos && resa.photos[0]
            ? <Image source={{ uri: resa.photos[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            : <Text style={{ fontSize: 32 }}>{resa.type === 'nourriture' ? '🍱' : '📦'}</Text>
          }
        </View>
        <View style={{ padding: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.txt, marginBottom: 4 }} numberOfLines={1}>{resa.titre}</Text>
          <Text style={{ fontSize: 11, color: theme.txt2, marginBottom: 8 }}>
            {resa.quartier} · {resa.ville} · {resa.nom} {resa.prenom}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: statut.color }}>{statut.label}</Text>
            <Text style={{ fontSize: 10, color: theme.txt3 }}>
              · {new Date(resa.cree_le).toLocaleDateString('fr-SN')}
            </Text>
          </View>

          {besoinConfirmation && (
            <View style={{ backgroundColor: 'rgba(45,122,79,0.15)', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(45,122,79,0.3)' }}>
              <Text style={{ fontSize: 12, color: '#4ADE80', fontWeight: '600', marginBottom: 6 }}>
                ✅ Avez-vous reçu ce don ?
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: theme.gr, borderRadius: 8, padding: 8, alignItems: 'center' }}
                  onPress={() => handleConfirmer(resa)}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: 'white' }}>✓ Oui, reçu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: theme.card2, borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: theme.bd }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt2 }}>✗ Pas encore</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* EVALUER */}
          {peutEvaluer && (
            <TouchableOpacity
              style={{ backgroundColor: theme.orl, borderRadius: 9, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.or, marginBottom: 8 }}
              onPress={() => setEvalModal({
                evalueId:  resa.proprietaire_id,
                evalueNom: resa.prenom+' '+resa.nom,
                donId:     resa.don_id,
                donTitre:  resa.titre,
              })}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.or }}>⭐ Évaluer {resa.prenom}</Text>
            </TouchableOpacity>
          )}

          {resa.statut === 'cloture' && dejaEvalues[resa.don_id] && (
            <View style={{ backgroundColor: theme.grl, borderRadius: 9, padding: 8, alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.gr }}>✓ Vous avez évalué ce don</Text>
            </View>
          )}

          {!['cloture', 'annule'].includes(resa.statut) && (
            <TouchableOpacity
              style={{ backgroundColor: '#3A1A1A', borderRadius: 9, padding: 9, alignItems: 'center', borderWidth: 1, borderColor: '#FF6B6B' }}
              onPress={() => handleAnnuler(resa)}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#FF6B6B' }}>Annuler la réservation</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const listes = { en_cours: enCours, termines, annules };
  const courante = listes[onglet] || [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ backgroundColor: theme.hdr, padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: theme.bd }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: theme.txt2, fontWeight: '600' }}>← Retour</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt }}>📋 Mes réservations</Text>
        <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 2 }}>{enCours.length} en cours · {termines.length} complétées</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: theme.hdr, borderBottomWidth: 1, borderBottomColor: theme.bd, maxHeight: 44 }}>
        {[
          ['en_cours',  'En cours ('+enCours.length+')'],
          ['termines',  'Complétées ('+termines.length+')'],
          ['annules',   'Annulées ('+annules.length+')'],
        ].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={{ paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: onglet === key ? theme.or : 'transparent' }}
            onPress={() => setOnglet(key)}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: onglet === key ? theme.or : theme.txt2 }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading
        ? <ActivityIndicator size="large" color={theme.or} style={{ marginTop: 40 }} />
        : <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); }} tintColor={theme.or} />}
            style={{ marginTop: 14 }}
          >
            {courante.length === 0
              ? <Text style={{ textAlign: 'center', color: theme.txt2, marginTop: 40, fontSize: 14 }}>
                  Aucune réservation ici.
                </Text>
              : courante.map(resa => <ResaCard key={resa.id} resa={resa} />)
            }
            <View style={{ height: 30 }} />
          </ScrollView>
      }

      {/* MODAL EVALUATION */}
      <EvaluationModal
        visible={!!evalModal}
        onClose={() => setEvalModal(null)}
        evalueId={evalModal?.evalueId}
        evalueNom={evalModal?.evalueNom}
        donId={evalModal?.donId}
        donTitre={evalModal?.donTitre}
        onSuccess={charger}
      />
    </View>
  );
}
