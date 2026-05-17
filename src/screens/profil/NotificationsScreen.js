import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const TYPES_NOTIF = {
  reservation:          { ico: '🎁', couleur: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  contact:              { ico: '📱', couleur: '#25D366', bg: 'rgba(37,211,102,0.12)' },
  confirmation_requise: { ico: '✅', couleur: '#2D7A4F', bg: 'rgba(45,122,79,0.12)' },
  don_cloture:          { ico: '🎉', couleur: '#2D7A4F', bg: 'rgba(45,122,79,0.12)' },
  don_supprime:         { ico: '❌', couleur: '#CC2222', bg: 'rgba(204,34,34,0.12)' },
  enchere_offre:        { ico: '🔨', couleur: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  enchere_gagnant:      { ico: '🏆', couleur: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  enchere_termine:      { ico: '🔔', couleur: '#6B6B6B', bg: 'rgba(107,107,107,0.12)' },
};

const formaterTemps = (date) => {
  const diff = new Date() - new Date(date);
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const j    = Math.floor(diff / 86400000);
  if (min < 1)  return 'À l\'instant';
  if (min < 60) return 'Il y a '+min+' min';
  if (h < 24)   return 'Il y a '+h+'h';
  if (j < 7)    return 'Il y a '+j+' jour'+(j > 1 ? 's' : '');
  return new Date(date).toLocaleDateString('fr-SN');
};

export default function NotificationsScreen({ navigation }) {
  const { theme }    = useTheme();
  const [notifs,     setNotifs]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const charger = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifs(res.notifications || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const marquerLu = async (id) => {
    try {
      await api.put('/notifications/'+id+'/lire');
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    } catch (err) { console.error(err); }
  };

  const marquerTousLus = async () => {
    try {
      await api.put('/notifications/lire-tout');
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { charger(); }, []);

  const nonLues = notifs.filter(n => !n.lu).length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* HEADER */}
      <View style={{ backgroundColor: theme.hdr, padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: theme.bd }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt }}>🔔 Notifications</Text>
            <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 2 }}>
              {nonLues > 0 ? nonLues+' non lue'+(nonLues > 1 ? 's' : '') : 'Tout lu'}
            </Text>
          </View>
          {nonLues > 0 && (
            <TouchableOpacity
              style={{ backgroundColor: theme.orl, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: theme.or }}
              onPress={marquerTousLus}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.or }}>Tout lire</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading
        ? <ActivityIndicator size="large" color={theme.or} style={{ marginTop: 40 }} />
        : <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); }} tintColor={theme.or} />}
          >
            {notifs.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 40 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>🔔</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.txt, marginBottom: 8 }}>Aucune notification</Text>
                <Text style={{ fontSize: 14, color: theme.txt2, textAlign: 'center', lineHeight: 20 }}>
                  Vos notifications apparaîtront ici — réservations, confirmations, enchères...
                </Text>
              </View>
            ) : (
              <>
                {/* NON LUES */}
                {notifs.filter(n => !n.lu).length > 0 && (
                  <>
                    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: theme.txt3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nouvelles</Text>
                    </View>
                    {notifs.filter(n => !n.lu).map(notif => (
                      <NotifCard key={notif.id} notif={notif} theme={theme} onPress={() => marquerLu(notif.id)} />
                    ))}
                  </>
                )}

                {/* LUES */}
                {notifs.filter(n => n.lu).length > 0 && (
                  <>
                    <View style={{ paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: theme.txt3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Précédentes</Text>
                    </View>
                    {notifs.filter(n => n.lu).map(notif => (
                      <NotifCard key={notif.id} notif={notif} theme={theme} onPress={() => {}} />
                    ))}
                  </>
                )}
              </>
            )}
            <View style={{ height: 30 }} />
          </ScrollView>
      }
    </View>
  );
}

const NotifCard = ({ notif, theme, onPress }) => {
  const type = TYPES_NOTIF[notif.type] || { ico: '🔔', couleur: '#6B6B6B', bg: 'rgba(107,107,107,0.1)' };
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        padding: 14,
        paddingHorizontal: 16,
        backgroundColor: notif.lu ? theme.card : type.bg,
        borderBottomWidth: 1,
        borderBottomColor: theme.bd,
        borderLeftWidth: notif.lu ? 0 : 3,
        borderLeftColor: type.couleur,
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: type.bg, justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0 }}>
        <Text style={{ fontSize: 18 }}>{type.ico}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: notif.lu ? '600' : '700', color: theme.txt, marginBottom: 3 }}>{notif.titre}</Text>
        <Text style={{ fontSize: 12, color: theme.txt2, lineHeight: 18 }}>{notif.message}</Text>
        <Text style={{ fontSize: 10, color: theme.txt3, marginTop: 5 }}>{formaterTemps(notif.cree_le)}</Text>
      </View>
      {!notif.lu && (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: type.couleur, marginLeft: 8, marginTop: 4, flexShrink: 0 }} />
      )}
    </TouchableOpacity>
  );
};
