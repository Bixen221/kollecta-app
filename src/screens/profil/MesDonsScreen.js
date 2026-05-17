import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function MesDonsScreen({ navigation }) {
  const { theme }    = useTheme();
  const [dons,       setDons]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [onglet,     setOnglet]     = useState('actifs');

  const charger = async () => {
    try {
      const res = await api.get('/dons/mes-dons');
      setDons(res.dons || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { charger(); }, []);

  const actifs   = dons.filter(d => d.statut === 'actif');
  const clotures = dons.filter(d => d.statut === 'cloture');

  const handleSupprimer = (donId) => {
    Alert.alert('Supprimer ce don ?', 'Les réservants seront notifiés.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.delete('/dons/'+donId);
          charger();
        } catch (err) { Alert.alert('Erreur', err.message); }
      }},
    ]);
  };

  const DonCard = ({ don }) => {
    const pourcent = don.quantite_total > 0
      ? Math.round((1 - don.quantite_dispo / don.quantite_total) * 100)
      : 0;

    return (
      <View style={{ backgroundColor: theme.card, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1.5, borderColor: don.statut === 'cloture' ? theme.gr : theme.or }}>
        <View style={{ height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }}>
          <Text style={{ fontSize: 32 }}>{don.type === 'nourriture' ? '🍱' : '📦'}</Text>
        </View>
        <View style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: theme.txt, flex: 1 }} numberOfLines={1}>{don.titre}</Text>
            {don.nb_reservations > 0 && (
              <View style={{ backgroundColor: theme.bordl, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: theme.bord }}>{don.nb_reservations} résa</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 11, color: theme.txt2, marginBottom: 8 }}>{don.quartier} · {don.ville}</Text>

          {don.statut === 'actif' && (
            <>
              <View style={{ height: 5, backgroundColor: theme.bd, borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
                <View style={{ width: pourcent+'%', height: '100%', backgroundColor: theme.gr, borderRadius: 10 }} />
              </View>
              <Text style={{ fontSize: 10, color: theme.txt2, marginBottom: 10 }}>{don.quantite_dispo}/{don.quantite_total} disponibles</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: theme.card2, borderRadius: 9, padding: 9, alignItems: 'center', borderWidth: 1, borderColor: theme.bd }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.or }}>✏️ Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: '#3A1A1A', borderRadius: 9, padding: 9, alignItems: 'center', borderWidth: 1, borderColor: '#FF6B6B' }}
                  onPress={() => handleSupprimer(don.id)}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#FF6B6B' }}>🗑️ Supprimer</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {don.statut === 'cloture' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ backgroundColor: theme.grl, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.gr }}>✅ Don complété</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ backgroundColor: theme.hdr, padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: theme.bd }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: theme.txt2, fontWeight: '600' }}>← Retour</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt }}>🎁 Mes dons publiés</Text>
        <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 2 }}>{actifs.length} actifs · {clotures.length} complétés</Text>
      </View>

      {/* ONGLETS */}
      <View style={{ flexDirection: 'row', backgroundColor: theme.hdr, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.bd }}>
        {[['actifs', 'Actifs ('+actifs.length+')'], ['clotures', 'Complétés ('+clotures.length+')']].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={{ paddingVertical: 12, marginRight: 20, borderBottomWidth: 2, borderBottomColor: onglet === key ? theme.or : 'transparent' }}
            onPress={() => setOnglet(key)}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: onglet === key ? theme.or : theme.txt2 }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator size="large" color={theme.or} style={{ marginTop: 40 }} />
        : <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); }} tintColor={theme.or} />}
            style={{ marginTop: 14 }}
          >
            {(onglet === 'actifs' ? actifs : clotures).length === 0
              ? <Text style={{ textAlign: 'center', color: theme.txt2, marginTop: 40, fontSize: 14 }}>
                  {onglet === 'actifs' ? 'Aucun don actif.' : 'Aucun don complété.'}
                </Text>
              : (onglet === 'actifs' ? actifs : clotures).map(don => <DonCard key={don.id} don={don} />)
            }
            <View style={{ height: 30 }} />
          </ScrollView>
      }
    </View>
  );
}
