import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const API_URL = 'https://kollecta-backend.onrender.com/api';

export default function ModifierProfilScreen({ navigation }) {
  const { user, connexion } = useAuth();
  const { theme } = useTheme();
  const [form, setForm] = useState({
    nom:      user?.nom      || '',
    prenom:   user?.prenom   || '',
    whatsapp: user?.whatsapp || '',
    quartier: user?.quartier || '',
    ville:    user?.ville    || 'Dakar',
  });
  const [avatarUri,     setAvatarUri]     = useState(user?.avatar_url || null);
  const [avatarLocal,   setAvatarLocal]   = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const choisirPhoto = () => {
    Alert.alert('Photo de profil', 'Choisissez une option', [
      { text: '📷 Prendre une photo', onPress: () => lancerPicker('camera') },
      { text: '🖼️ Galerie photo',     onPress: () => lancerPicker('galerie') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const lancerPicker = async (source) => {
    try {
      let result;
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission refusée', 'Autorisez l\'accès à la caméra.');
        result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission refusée', 'Autorisez l\'accès aux photos.');
        result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      }
      if (!result.canceled && result.assets?.length > 0) {
        setAvatarLocal(result.assets[0]);
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  const uploaderAvatar = async () => {
    if (!avatarLocal) return null;
    setUploadingPhoto(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      const formData = new FormData();
      formData.append('photo', { uri: avatarLocal.uri, type: 'image/jpeg', name: 'avatar.jpg' });
      formData.append('entite_type', 'avatar');
      formData.append('entite_id', user.id);
      formData.append('ordre', '0');

      const res = await fetch(API_URL+'/medias/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer '+token, 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.media.url;
    } catch (err) {
      Alert.alert('Erreur photo', err.message);
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSauvegarder = async () => {
    setLoading(true);
    try {
      let avatarUrl = user?.avatar_url;

      if (avatarLocal) {
        const url = await uploaderAvatar();
        if (url) {
          avatarUrl = url;
          await api.put('/auth/avatar', { avatar_url: url });
        }
      }

      await api.put('/auth/profil', form);

      Alert.alert('✅ Profil mis à jour !', 'Vos informations ont été sauvegardées.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView>
        <View style={{ backgroundColor: theme.hdr, padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: theme.bd }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: theme.txt2, fontWeight: '600' }}>← Retour</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt }}>✏️ Modifier mon profil</Text>
        </View>

        <View style={{ padding: 16 }}>
          {/* AVATAR */}
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <TouchableOpacity onPress={choisirPhoto} style={{ position: 'relative' }}>
              <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: theme.card2, borderWidth: 2, borderColor: theme.or, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                {avatarUri
                  ? <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  : <Text style={{ fontSize: 30, fontWeight: '800', color: theme.or }}>{form.prenom?.[0]}{form.nom?.[0]}</Text>
                }
              </View>
              <View style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: theme.or, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.bg }}>
                <Text style={{ fontSize: 14 }}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 10 }}>Touchez pour changer la photo</Text>
          </View>

          <View style={{ backgroundColor: theme.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: theme.bd }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Informations personnelles</Text>

            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.txt2, marginBottom: 6 }}>PRÉNOM</Text>
            <TextInput style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, padding: 12, fontSize: 14, color: theme.txt, marginBottom: 12 }} value={form.prenom} onChangeText={v => update('prenom', v)} placeholder="Votre prénom" placeholderTextColor={theme.txt3} />

            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.txt2, marginBottom: 6 }}>NOM</Text>
            <TextInput style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, padding: 12, fontSize: 14, color: theme.txt, marginBottom: 12 }} value={form.nom} onChangeText={v => update('nom', v)} placeholder="Votre nom" placeholderTextColor={theme.txt3} />

            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.txt2, marginBottom: 6 }}>WHATSAPP</Text>
            <TextInput style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, padding: 12, fontSize: 14, color: theme.txt, marginBottom: 12 }} value={form.whatsapp} onChangeText={v => update('whatsapp', v)} placeholder="+221XXXXXXXXX" placeholderTextColor={theme.txt3} keyboardType="phone-pad" />
          </View>

          <View style={{ backgroundColor: theme.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: theme.bd }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Localisation</Text>

            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.txt2, marginBottom: 6 }}>QUARTIER</Text>
            <TextInput style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, padding: 12, fontSize: 14, color: theme.txt, marginBottom: 12 }} value={form.quartier} onChangeText={v => update('quartier', v)} placeholder="Ex: Plateau, Mermoz..." placeholderTextColor={theme.txt3} />

            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.txt2, marginBottom: 6 }}>VILLE</Text>
            <TextInput style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, padding: 12, fontSize: 14, color: theme.txt }} value={form.ville} onChangeText={v => update('ville', v)} placeholder="Dakar" placeholderTextColor={theme.txt3} />
          </View>

          <TouchableOpacity
            style={{ backgroundColor: theme.or, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8, opacity: (loading || uploadingPhoto) ? 0.7 : 1 }}
            onPress={handleSauvegarder}
            disabled={loading || uploadingPhoto}
          >
            {(loading || uploadingPhoto)
              ? <ActivityIndicator color={theme.dark} />
              : <Text style={{ fontSize: 16, fontWeight: '800', color: '#0E0A08' }}>Sauvegarder ✓</Text>
            }
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
