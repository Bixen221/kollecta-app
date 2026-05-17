import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import * as SecureStore from 'expo-secure-store';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', dark2: '#1A120E',
  light: '#B0A090', bd: 'rgba(201,168,76,0.2)',
};

const API_URL = 'https://kollecta-backend.onrender.com/api';

const CATEGORIES = {
  nourriture: ['Riz & Céréales', 'Légumes & Fruits', 'Viande & Poisson', 'Huile & Épices', 'Autre'],
  materiel:   ['Vêtements', 'Scolaire', 'Électronique', 'Mobilier', 'Jouets', 'Autre'],
};

const FORM_INITIAL = {
  type:        'nourriture',
  titre:       '',
  categorie:   '',
  description: '',
  quartier:    '',
  ville:       'Dakar',
  quantite:    '1',
  urgent:      false,
  photos:      [],
};

export default function PublierDonScreen({ navigation }) {
  const [form,    setForm]    = useState(FORM_INITIAL);
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const reinitialiser = () => setForm(FORM_INITIAL);

  const ajouterPhoto = async (source) => {
    if (form.photos.length >= 5) {
      return Alert.alert('Maximum atteint', 'Vous pouvez ajouter maximum 5 photos.');
    }
    try {
      let result;
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission refusée', 'Autorisez l\'accès à la caméra.');
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission refusée', 'Autorisez l\'accès aux photos.');
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });
      }
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setForm(f => ({ ...f, photos: [...f.photos, result.assets[0]] }));
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  const afficherChoix = () => {
    Alert.alert('Ajouter une photo', 'Choisissez une option', [
      { text: '📷 Prendre une photo', onPress: () => ajouterPhoto('camera') },
      { text: '🖼️ Galerie photo',     onPress: () => ajouterPhoto('galerie') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const supprimerPhoto = (index) => {
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
  };

  const handlePublier = async () => {
    if (!form.titre.trim())    return Alert.alert('Erreur', 'Le titre est obligatoire.');
    if (!form.quartier.trim()) return Alert.alert('Erreur', 'Le quartier est obligatoire.');

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');

      const resDon = await api.post('/dons', {
        titre:          form.titre.trim(),
        description:    form.description.trim(),
        type:           form.type,
        categorie:      form.categorie || CATEGORIES[form.type][0],
        quartier:       form.quartier.trim(),
        ville:          form.ville.trim(),
        quantite_total: parseInt(form.quantite) || 1,
        urgent:         form.urgent,
      });

      const donId = resDon.don.id;

      for (let i = 0; i < form.photos.length; i++) {
        const photo    = form.photos[i];
        const formData = new FormData();
        formData.append('photo', { uri: photo.uri, type: 'image/jpeg', name: 'photo_'+i+'.jpg' });
        formData.append('entite_type', 'don');
        formData.append('entite_id',   donId);
        formData.append('ordre',       String(i));
        await fetch(API_URL+'/medias/upload', {
          method:  'POST',
          headers: { 'Authorization': 'Bearer '+token, 'Content-Type': 'multipart/form-data' },
          body:    formData,
        });
      }

      reinitialiser();
      Alert.alert(
        '✅ Don publié !',
        'Votre annonce est visible par la communauté.\n\nVoulez-vous publier un autre don ?',
        [
          { text: 'Non, retour', onPress: () => navigation.goBack() },
          { text: 'Oui, nouveau don' },
        ]
      );
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.dark }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backTxt}>← Retour</Text></TouchableOpacity>
          <Text style={styles.titre}>Publier un don</Text>
          <Text style={styles.sous}>Partagez avec la communauté Kollecta</Text>
        </View>

        <View style={styles.body}>

          {/* TYPE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Type de don *</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity style={[styles.typeBtn, form.type==='nourriture' && styles.typeBtnAct]} onPress={() => { update('type','nourriture'); update('categorie',''); }}>
                <Text style={styles.typeEmoji}>🍱</Text>
                <Text style={[styles.typeTxt, form.type==='nourriture' && styles.typeTxtAct]}>Nourriture</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, form.type==='materiel' && styles.typeBtnAct]} onPress={() => { update('type','materiel'); update('categorie',''); }}>
                <Text style={styles.typeEmoji}>📦</Text>
                <Text style={[styles.typeTxt, form.type==='materiel' && styles.typeTxtAct]}>Matériel</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PHOTOS */}
          <View style={styles.section}>
            <View style={styles.photoHeader}>
              <Text style={styles.sectionTitre}>Photos ({form.photos.length}/5)</Text>
              {form.photos.length < 5 && (
                <TouchableOpacity style={styles.ajouterBtn} onPress={afficherChoix}>
                  <Text style={styles.ajouterBtnTxt}>+ Ajouter</Text>
                </TouchableOpacity>
              )}
            </View>

            {form.photos.length === 0 ? (
              <TouchableOpacity style={styles.photoPlaceholder} onPress={afficherChoix}>
                <Text style={{ fontSize: 30, marginBottom: 8 }}>📷</Text>
                <Text style={styles.photoTxt}>Ajouter des photos</Text>
                <Text style={styles.photoSous}>Maximum 5 · Optionnel</Text>
              </TouchableOpacity>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {form.photos.map((photo, i) => (
                  <View key={i} style={styles.photoWrap}>
                    <Image source={{ uri: photo.uri }} style={styles.photoImg} />
                    <TouchableOpacity style={styles.photoSuppr} onPress={() => supprimerPhoto(i)}>
                      <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>✕</Text>
                    </TouchableOpacity>
                    {i === 0 && <View style={styles.photoPrinc}><Text style={styles.photoProncTxt}>Principale</Text></View>}
                  </View>
                ))}
                {form.photos.length < 5 && (
                  <TouchableOpacity style={styles.photoAjouter} onPress={afficherChoix}>
                    <Text style={{ fontSize: 26, color: COLORS.light }}>+</Text>
                    <Text style={{ fontSize: 11, color: COLORS.light, marginTop: 4 }}>Ajouter</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>

          {/* INFOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Informations *</Text>
            <Text style={styles.label}>Titre *</Text>
            <TextInput style={styles.input} placeholder="Ex: Riz basmati 25 kg..." placeholderTextColor={COLORS.light} value={form.titre} onChangeText={v => update('titre', v)} />

            <Text style={styles.label}>Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 38, marginBottom: 4 }}>
              {CATEGORIES[form.type].map(cat => (
                <TouchableOpacity key={cat} style={[styles.catPill, form.categorie===cat && styles.catPillAct]} onPress={() => update('categorie', cat)}>
                  <Text style={[styles.catTxt, form.categorie===cat && styles.catTxtAct]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Quantité, état, conditions..." placeholderTextColor={COLORS.light} value={form.description} onChangeText={v => update('description', v)} multiline />

            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Quantité</Text>
                <TextInput style={styles.input} value={form.quantite} onChangeText={v => update('quantite', v)} keyboardType="number-pad" placeholderTextColor={COLORS.light} />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.label}>Urgent ?</Text>
                <TouchableOpacity style={[styles.urgentBtn, form.urgent && styles.urgentBtnAct]} onPress={() => update('urgent', !form.urgent)}>
                  <Text style={[styles.urgentTxt, form.urgent && { color: '#FF6B6B' }]}>{form.urgent ? '🚨 Oui, urgent' : 'Non urgent'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* LOCALISATION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Localisation *</Text>
            <Text style={styles.label}>Quartier *</Text>
            <TextInput style={styles.input} placeholder="Ex: Plateau, Mermoz..." placeholderTextColor={COLORS.light} value={form.quartier} onChangeText={v => update('quartier', v)} />
            <Text style={styles.label}>Ville</Text>
            <TextInput style={styles.input} placeholder="Dakar" placeholderTextColor={COLORS.light} value={form.ville} onChangeText={v => update('ville', v)} />
          </View>

          <TouchableOpacity style={[styles.btnPublier, loading && { opacity: 0.7 }]} onPress={handlePublier} disabled={loading}>
            {loading ? <ActivityIndicator color="#0E0A08" /> : <Text style={styles.btnPublierTxt}>Publier le don ✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center', padding: 12, marginTop: 8 }} onPress={reinitialiser}>
            <Text style={{ fontSize: 13, color: COLORS.light, fontWeight: '600' }}>🗑️ Réinitialiser le formulaire</Text>
          </TouchableOpacity>

          <Text style={{ textAlign: 'center', fontSize: 11, color: COLORS.light, marginTop: 8 }}>En publiant, vous acceptez les conditions Kollecta</Text>
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header:        { padding: 20, paddingTop: 55 },
  backTxt:       { color: COLORS.light, fontSize: 13, fontWeight: '600', marginBottom: 12 },
  titre:         { fontSize: 24, fontWeight: '800', color: '#F0E8D8', marginBottom: 4 },
  sous:          { fontSize: 13, color: COLORS.light },
  body:          { padding: 16 },
  section:       { backgroundColor: '#1E1612', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.bd },
  sectionTitre:  { fontSize: 12, fontWeight: '700', color: COLORS.light, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  typeRow:       { flexDirection: 'row', gap: 10 },
  typeBtn:       { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', backgroundColor: '#2A1E18', borderWidth: 1.5, borderColor: COLORS.bd },
  typeBtnAct:    { borderColor: COLORS.or, backgroundColor: 'rgba(201,168,76,0.1)' },
  typeEmoji:     { fontSize: 28, marginBottom: 6 },
  typeTxt:       { fontSize: 13, fontWeight: '700', color: COLORS.light },
  typeTxtAct:    { color: COLORS.or },
  photoHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ajouterBtn:    { backgroundColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: COLORS.or },
  ajouterBtnTxt: { fontSize: 12, fontWeight: '700', color: COLORS.or },
  photoPlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2A1E18', borderRadius: 10, borderWidth: 2, borderColor: COLORS.bd, borderStyle: 'dashed' },
  photoTxt:      { fontSize: 14, color: '#F0E8D8', fontWeight: '600' },
  photoSous:     { fontSize: 11, color: COLORS.light, marginTop: 4 },
  photoWrap:     { position: 'relative', marginRight: 8 },
  photoImg:      { width: 110, height: 110, borderRadius: 10 },
  photoSuppr:    { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.7)', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  photoPrinc:    { position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(201,168,76,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  photoProncTxt: { color: '#0E0A08', fontSize: 9, fontWeight: '700' },
  photoAjouter:  { width: 110, height: 110, borderRadius: 10, backgroundColor: '#2A1E18', borderWidth: 2, borderColor: COLORS.bd, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  label:         { fontSize: 11, fontWeight: '700', color: COLORS.light, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, marginTop: 10 },
  input:         { backgroundColor: '#0E0A08', borderWidth: 1, borderColor: COLORS.bd, borderRadius: 10, padding: 12, fontSize: 14, color: '#F0E8D8' },
  catPill:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.bd, marginRight: 7, backgroundColor: '#2A1E18' },
  catPillAct:    { backgroundColor: COLORS.bord, borderColor: COLORS.bord },
  catTxt:        { fontSize: 12, fontWeight: '600', color: COLORS.light },
  catTxtAct:     { color: 'white' },
  urgentBtn:     { backgroundColor: '#0E0A08', borderWidth: 1, borderColor: COLORS.bd, borderRadius: 10, padding: 12, alignItems: 'center' },
  urgentBtnAct:  { backgroundColor: 'rgba(204,34,34,0.15)', borderColor: '#CC2222' },
  urgentTxt:     { fontSize: 13, color: COLORS.light, fontWeight: '600' },
  btnPublier:    { backgroundColor: COLORS.or, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  btnPublierTxt: { fontSize: 16, fontWeight: '800', color: '#0E0A08' },
});
