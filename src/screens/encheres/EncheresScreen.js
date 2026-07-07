import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Image, Dimensions } from 'react-native';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - 16 * 2 - 10) / 2;

const getTempsRestant = (fin_le) => {
  const diff = new Date(fin_le) - new Date();
  if (diff <= 0) return 'Terminée';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return Math.floor(h/24)+'j '+h%24+'h';
  return h+'h '+m+'m';
};

export default function EncheresScreen({ navigation }) {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const [encheres,   setEncheres]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtre,     setFiltre]     = useState('Tout');
  const [recherche,  setRecherche]  = useState('');
  const [vue,        setVue]        = useState('liste');

  const filtres = ['Tout', 'En cours', 'À venir', 'Terminées'];

  const charger = async () => {
    try {
      const params = {};
      if (filtre === 'En cours')  params.statut = 'en_cours';
      if (filtre === 'À venir')   params.statut = 'a_venir';
      if (filtre === 'Terminées') params.statut = 'termine';
      const res = await api.get('/encheres', { params });
      const filtered = (res.encheres || []).filter(e => e.vendeur_id !== user?.id);
      setEncheres(filtered);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { charger(); }, [filtre]);

  const encheresFiltres = encheres.filter(e =>
    e.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
    e.quartier?.toLowerCase().includes(recherche.toLowerCase()) ||
    e.categorie?.toLowerCase().includes(recherche.toLowerCase())
  );

  const CarteListe = ({ e }) => (
    <TouchableOpacity
      style={{ backgroundColor: theme.card, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: theme.bd }}
      onPress={() => navigation.navigate('DetailEnchere', { enchereId: e.id })}
    >
      <View style={{ height: 130, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.card2, position: 'relative' }}>
        {e.photos && e.photos[0]
          ? <Image source={{ uri: e.photos[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          : <Text style={{ fontSize: 44 }}>📦</Text>
        }
        <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: e.statut === 'en_cours' ? theme.bord : theme.card, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: theme.bd }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: e.statut === 'en_cours' ? 'white' : theme.or }}>
            {e.statut === 'en_cours' ? '🔴 EN DIRECT' : e.statut === 'a_venir' ? 'À venir' : 'Terminée'}
          </Text>
        </View>
        {e.statut === 'en_cours' && (
          <View style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.72)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#C9A84C' }}>⏱ {getTempsRestant(e.fin_le)}</Text>
          </View>
        )}
      </View>
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.txt, marginBottom: 8 }}>{e.titre}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={{ fontSize: 10, color: theme.txt2, marginBottom: 2 }}>Offre actuelle</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.bord }}>{e.offre_actuelle?.toLocaleString()} FCFA</Text>
            <Text style={{ fontSize: 10, color: theme.txt2 }}>🙋 {e.nb_offres} enchères</Text>
          </View>
          <View style={{ backgroundColor: e.statut === 'en_cours' ? theme.bord : theme.txt3, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: 'white' }}>
              {e.statut === 'en_cours' ? 'Enchérir →' : 'Voir'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const CarteGrille = ({ e }) => (
    <TouchableOpacity
      style={{ width: GRID_CARD_WIDTH, backgroundColor: theme.card, borderRadius: 14, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: theme.bd }}
      onPress={() => navigation.navigate('DetailEnchere', { enchereId: e.id })}
    >
      <View style={{ height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.card2, position: 'relative' }}>
        {e.photos && e.photos[0]
          ? <Image source={{ uri: e.photos[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          : <Text style={{ fontSize: 32 }}>📦</Text>
        }
        <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: e.statut === 'en_cours' ? theme.bord : theme.card, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20, borderWidth: 1, borderColor: theme.bd }}>
          <Text style={{ fontSize: 8, fontWeight: '700', color: e.statut === 'en_cours' ? 'white' : theme.or }}>
            {e.statut === 'en_cours' ? '🔴 DIRECT' : e.statut === 'a_venir' ? 'À venir' : 'Fin'}
          </Text>
        </View>
      </View>
      <View style={{ padding: 9 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt, marginBottom: 4 }} numberOfLines={1}>{e.titre}</Text>
        <Text style={{ fontSize: 13, fontWeight: '800', color: theme.bord, marginBottom: 2 }}>{e.offre_actuelle?.toLocaleString()} F</Text>
        <Text style={{ fontSize: 9, color: theme.txt2 }}>🙋 {e.nb_offres} offres</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* HEADER */}
      <View style={{ backgroundColor: theme.hdr, padding: 20, paddingTop: 50 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: theme.or, letterSpacing: 2 }}>KOLLECTA</Text>
          <View style={{ flexDirection: 'row', backgroundColor: theme.card2, borderRadius: 10, borderWidth: 1, borderColor: theme.bd }}>
            <TouchableOpacity
              style={{ padding: 8, borderRadius: 9, backgroundColor: vue === 'liste' ? theme.or : 'transparent' }}
              onPress={() => setVue('liste')}
            >
              <Text style={{ fontSize: 15 }}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ padding: 8, borderRadius: 9, backgroundColor: vue === 'grille' ? theme.or : 'transparent' }}
              onPress={() => setVue('grille')}
            >
              <Text style={{ fontSize: 15 }}>▦</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt }}>🔨 Enchères</Text>
        <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 2, marginBottom: 14 }}>Misez sur les meilleures offres</Text>

        {/* RECHERCHE */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.card2, borderRadius: 11, padding: 10, borderWidth: 1, borderColor: theme.bd }}>
          <Text style={{ fontSize: 14, color: theme.txt3 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, fontSize: 13, color: theme.txt }}
            placeholder="Rechercher une enchère..."
            placeholderTextColor={theme.txt3}
            value={recherche}
            onChangeText={setRecherche}
          />
          {recherche.length > 0 && (
            <TouchableOpacity onPress={() => setRecherche('')}>
              <Text style={{ fontSize: 14, color: theme.txt3 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FILTRES */}
      <View style={{ height: 54, justifyContent: 'center' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
        >
          {filtres.map(f => (
            <TouchableOpacity
              key={f}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
                borderColor: filtre === f ? theme.bord : theme.bd, marginRight: 8,
                backgroundColor: filtre === f ? theme.bord : theme.card, height: 34, justifyContent: 'center',
              }}
              onPress={() => setFiltre(f)}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: filtre === f ? 'white' : theme.txt2 }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading
        ? <ActivityIndicator size="large" color={theme.or} style={{ marginTop: 40 }} />
        : <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); }} tintColor={theme.or} />}
          >
            {encheresFiltres.length === 0
              ? <Text style={{ textAlign: 'center', color: theme.txt2, marginTop: 40, fontSize: 14 }}>
                  {recherche ? 'Aucun résultat pour "'+recherche+'"' : 'Aucune enchère disponible.'}
                </Text>
              : vue === 'liste'
                ? encheresFiltres.map(e => <CarteListe key={e.id} e={e} />)
                : <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 }}>
                    {encheresFiltres.map(e => <CarteGrille key={e.id} e={e} />)}
                  </View>
            }
            <View style={{ height: 20 }} />
          </ScrollView>
      }
    </View>
  );
}
