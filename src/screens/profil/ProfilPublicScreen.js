import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function ProfilPublicScreen({ route, navigation }) {
  const { userId, nom, prenom } = route.params;
  const { theme } = useTheme();
  const [evaluations, setEvaluations] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      const res = await api.get('/evaluations/utilisateur/'+userId);
      setEvaluations(res.evaluations || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const noteMoyenne = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + e.note, 0) / evaluations.length).toFixed(1)
    : '0.0';

  const repartition = [5, 4, 3, 2, 1].map(n => ({
    note:   n,
    nombre: evaluations.filter(e => e.note === n).length,
  }));

  const Etoiles = ({ note, taille = 14 }) => (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Text key={n} style={{ fontSize: taille, opacity: n <= note ? 1 : 0.25 }}>⭐</Text>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ backgroundColor: theme.hdr, padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: theme.bd, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: theme.txt2, fontWeight: '600' }}>← Retour</Text>
        </TouchableOpacity>

        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.card2, borderWidth: 2, borderColor: theme.or, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: theme.or }}>{prenom?.[0]}{nom?.[0]}</Text>
        </View>
        <Text style={{ fontSize: 19, fontWeight: '800', color: theme.txt }}>{prenom} {nom}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <Etoiles note={Math.round(noteMoyenne)} taille={16} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.or }}>{noteMoyenne}</Text>
          <Text style={{ fontSize: 12, color: theme.txt2 }}>({evaluations.length} avis)</Text>
        </View>
      </View>

      {loading
        ? <ActivityIndicator size="large" color={theme.or} style={{ marginTop: 40 }} />
        : <ScrollView style={{ marginTop: 8 }}>

            {/* REPARTITION */}
            {evaluations.length > 0 && (
              <View style={{ backgroundColor: theme.card, borderRadius: 14, marginHorizontal: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.bd }}>
                {repartition.map(({ note, nombre }) => {
                  const pourcent = evaluations.length > 0 ? (nombre / evaluations.length) * 100 : 0;
                  return (
                    <View key={note} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Text style={{ fontSize: 11, color: theme.txt2, width: 12 }}>{note}</Text>
                      <Text style={{ fontSize: 11 }}>⭐</Text>
                      <View style={{ flex: 1, height: 6, backgroundColor: theme.bd, borderRadius: 10, overflow: 'hidden' }}>
                        <View style={{ width: pourcent+'%', height: '100%', backgroundColor: theme.or, borderRadius: 10 }} />
                      </View>
                      <Text style={{ fontSize: 11, color: theme.txt2, width: 20, textAlign: 'right' }}>{nombre}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* LISTE AVIS */}
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Avis reçus ({evaluations.length})
              </Text>
            </View>

            {evaluations.length === 0
              ? <View style={{ alignItems: 'center', marginTop: 30, paddingHorizontal: 40 }}>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}>⭐</Text>
                  <Text style={{ fontSize: 14, color: theme.txt2, textAlign: 'center' }}>
                    Aucun avis pour le moment.
                  </Text>
                </View>
              : evaluations.map(ev => (
                <View key={ev.id} style={{ backgroundColor: theme.card, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: theme.bd }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: theme.bord, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: 'white' }}>{ev.prenom?.[0]}{ev.nom?.[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: theme.txt }}>{ev.prenom} {ev.nom}</Text>
                      <Text style={{ fontSize: 10, color: theme.txt3 }}>{new Date(ev.cree_le).toLocaleDateString('fr-SN')}</Text>
                    </View>
                    <Etoiles note={ev.note} />
                  </View>
                  {ev.titre_don && (
                    <Text style={{ fontSize: 11, color: theme.txt3, marginBottom: ev.commentaire ? 6 : 0 }}>
                      Don : {ev.titre_don}
                    </Text>
                  )}
                  {ev.commentaire && (
                    <Text style={{ fontSize: 13, color: theme.txt2, lineHeight: 19 }}>{ev.commentaire}</Text>
                  )}
                </View>
              ))
            }
            <View style={{ height: 30 }} />
          </ScrollView>
      }
    </View>
  );
}
