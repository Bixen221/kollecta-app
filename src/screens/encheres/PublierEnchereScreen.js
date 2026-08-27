import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../context/ThemeContext';

const API_URL = 'https://kollecta-backend.onrender.com/api';

const CATEGORIES = ['Art', 'Électronique', 'Mode', 'Maison', 'Auto', 'Sport', 'Bijoux', 'Autre'];

const DUREES = [
  { label: '1 heure',   heures: 1 },
  { label: '6 heures',  heures: 6 },
  { label: '12 heures', heures: 12 },
  { label: '1 jour',    heures: 24 },
  { label: '2 jours',   heures: 48 },
  { label: '3 jours',   heures: 72 },
  { label: '7 jours',   heures: 168 },
];

const FORM_INITIAL = {
  titre:       '',
  description: '',
  categorie:   '',
  quartier:    '',
  ville:       'Dakar',
  prix_depart: '',
  duree:       24,
  photos:      [],
};

export default function PublierEnchereScreen({ navigation }) {
  const { theme }  = useTheme();
  const styles     = getStyles(theme);
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
    if (!form.titre.trim())       return Alert.alert('Erreur', 'Le titre est obligatoire.');
    if (!form.prix_depart)        return Alert.alert('Erreur', 'Le prix de départ est obligatoire.');
    if (!form.quartier.trim())    return Alert.alert('Erreur', 'Le quartier est obligatoire.');
    if (parseInt(form.prix_depart) <= 0) return Alert.alert('Erreur', 'Le prix doit être supérieur à 0.');

    setLoading(true);
    try {
      const token   = await SecureStore.getItemAsync('token');
      const debut   = new Date();
      const fin     = new Date(debut.getTime() + form.duree * 3600000);

      const resEnc = await api.post('/encheres', {
        titre:       form.titre.trim(),
        description: form.description.trim(),
        categorie:   form.categorie || CATEGORIES[0],
        quartier:    form.quartier.trim(),
        ville:       form.ville.trim(),
        prix_depart: parseInt(form.prix_depart),
        debut_le:    debut.toISOString(),
        fin_le:      fin.toISOString(),
      });

      const enchereId = resEnc.enchere.id;

      // Upload photos
      for (let i = 0; i < form.photos.length; i++) {
        const photo    = form.photos[i];
        const formData = new FormData();
        formData.append('photo', { uri: photo.uri, type: 'image/jpeg', name: 'photo_'+i+'.jpg' });
        formData.append('entite_type', 'enchere');
        formData.append('entite_id',   enchereId);
        formData.append('ordre',       String(i));
        await fetch(API_URL+'/medias/upload', {
          method:  'POST',
          headers: { 'Authorization': 'Bearer '+token, 'Content-Type': 'multipart/form-data' },
          body:    formData,
        });
      }

      reinitialiser();
      Alert.alert(
        '✅ Enchère lancée !',
        'Votre enchère est maintenant en direct sur Kollecta.\n\nVoulez-vous lancer une autre enchère ?',
        [
          { text: 'Non, retour', onPress: () => navigation.goBack() },
          { text: 'Oui, nouvelle enchère' },
        ]
      );
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  const dureeSelectionnee = DUREES.find(d => d.heures === form.duree);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backTxt}>← Retour</Text></TouchableOpacity>
          <Text style={styles.titre}>Lancer une enchère</Text>
          <Text style={styles.sous}>Vendez au meilleur prix sur Kollecta</Text>
        </View>

        <View style={styles.body}>

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
                <Text style={styles.photoSous}>Maximum 5 · Recommandé</Text>
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
                    <Text style={{ fontSize: 26, color: theme.txt2 }}>+</Text>
                    <Text style={{ fontSize: 11, color: theme.txt2, marginTop: 4 }}>Ajouter</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>

          {/* INFOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Informations *</Text>

            <Text style={styles.label}>Titre *</Text>
            <TextInput style={styles.input} placeholder="Ex: Samsung Galaxy A54, Tableau original..." placeholderTextColor={theme.txt3} value={form.titre} onChangeText={v => update('titre', v)} />

            <Text style={styles.label}>Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 38, marginBottom: 4 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} style={[styles.catPill, form.categorie===cat && styles.catPillAct]} onPress={() => update('categorie', cat)}>
                  <Text style={[styles.catTxt, form.categorie===cat && styles.catTxtAct]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="État, caractéristiques, conditions de vente..." placeholderTextColor={theme.txt3} value={form.description} onChangeText={v => update('description', v)} multiline />
          </View>

          {/* PRIX */}
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Prix de départ *</Text>
            <View style={styles.prixWrap}>
              <TextInput
                style={styles.prixInput}
                placeholder="0"
                placeholderTextColor={theme.txt3}
                value={form.prix_depart}
                onChangeText={v => update('prix_depart', v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
              <Text style={styles.prixSuffix}>FCFA</Text>
            </View>
            <Text style={styles.prixHint}>Les enchérisseurs devront proposer un montant supérieur</Text>
          </View>

          {/* DURÉE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Durée de l'enchère</Text>
            <View style={styles.dureeGrid}>
              {DUREES.map(d => (
                <TouchableOpacity
                  key={d.heures}
                  style={[styles.dureeBtn, form.duree===d.heures && styles.dureeBtnAct]}
                  onPress={() => update('duree', d.heures)}
                >
                  <Text style={[styles.dureeTxt, form.duree===d.heures && styles.dureeTxtAct]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.dureeInfo}>
              <Text style={styles.dureeInfoTxt}>
                ⏱ L'enchère se terminera dans <Text style={{ color: theme.or, fontWeight: '700' }}>{dureeSelectionnee?.label}</Text>
              </Text>
            </View>
          </View>

          {/* LOCALISATION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Localisation *</Text>
            <Text style={styles.label}>Quartier *</Text>
            <TextInput style={styles.input} placeholder="Ex: Plateau, Mermoz..." placeholderTextColor={theme.txt3} value={form.quartier} onChangeText={v => update('quartier', v)} />
            <Text style={styles.label}>Ville</Text>
            <TextInput style={styles.input} placeholder="Dakar" placeholderTextColor={theme.txt3} value={form.ville} onChangeText={v => update('ville', v)} />
          </View>

          {/* RECAP */}
          {form.titre && form.prix_depart && (
            <View style={styles.recap}>
              <Text style={styles.recapTitre}>Récapitulatif</Text>
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>Article</Text>
                <Text style={styles.recapVal}>{form.titre}</Text>
              </View>
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>Prix de départ</Text>
                <Text style={[styles.recapVal, { color: theme.bord, fontWeight: '800' }]}>{parseInt(form.prix_depart || 0).toLocaleString()} FCFA</Text>
              </View>
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>Durée</Text>
                <Text style={styles.recapVal}>{dureeSelectionnee?.label}</Text>
              </View>
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>Lieu</Text>
                <Text style={styles.recapVal}>{form.quartier || '-'}, {form.ville}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.btnPublier, loading && { opacity: 0.7 }]} onPress={handlePublier} disabled={loading}>
            {loading ? <ActivityIndicator color={theme.isDark ? '#0E0A08' : '#FFFFFF'} /> : <Text style={styles.btnPublierTxt}>🔨 Lancer l'enchère</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center', padding: 12, marginTop: 8 }} onPress={reinitialiser}>
            <Text style={{ fontSize: 13, color: theme.txt2, fontWeight: '600' }}>🗑️ Réinitialiser</Text>
          </TouchableOpacity>

          <Text style={{ textAlign: 'center', fontSize: 11, color: theme.txt2, marginTop: 8 }}>En publiant, vous acceptez les conditions Kollecta</Text>
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  header:        { padding: 20, paddingTop: 55 },
  backTxt:       { color: theme.txt2, fontSize: 13, fontWeight: '600', marginBottom: 12 },
  titre:         { fontSize: 24, fontWeight: '800', color: theme.txt, marginBottom: 4 },
  sous:          { fontSize: 13, color: theme.txt2 },
  body:          { padding: 16 },
  section:       { backgroundColor: theme.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: theme.bd },
  sectionTitre:  { fontSize: 12, fontWeight: '700', color: theme.txt2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  photoHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ajouterBtn:    { backgroundColor: theme.orl, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: theme.or },
  ajouterBtnTxt: { fontSize: 12, fontWeight: '700', color: theme.or },
  photoPlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.card2, borderRadius: 10, borderWidth: 2, borderColor: theme.bd, borderStyle: 'dashed' },
  photoTxt:      { fontSize: 14, color: theme.txt, fontWeight: '600' },
  photoSous:     { fontSize: 11, color: theme.txt2, marginTop: 4 },
  photoWrap:     { position: 'relative', marginRight: 8 },
  photoImg:      { width: 110, height: 110, borderRadius: 10 },
  photoSuppr:    { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.7)', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  photoPrinc:    { position: 'absolute', bottom: 5, left: 5, backgroundColor: theme.or, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  photoProncTxt: { color: theme.isDark ? '#0E0A08' : '#FFFFFF', fontSize: 9, fontWeight: '700' },
  photoAjouter:  { width: 110, height: 110, borderRadius: 10, backgroundColor: theme.card2, borderWidth: 2, borderColor: theme.bd, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  label:         { fontSize: 11, fontWeight: '700', color: theme.txt2, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, marginTop: 10 },
  input:         { backgroundColor: theme.inp, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, padding: 12, fontSize: 14, color: theme.txt },
  catPill:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: theme.bd, marginRight: 7, backgroundColor: theme.card2 },
  catPillAct:    { backgroundColor: theme.bord, borderColor: theme.bord },
  catTxt:        { fontSize: 12, fontWeight: '600', color: theme.txt2 },
  catTxtAct:     { color: 'white' },
  prixWrap:      { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inp, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 4 },
  prixInput:     { flex: 1, fontSize: 28, fontWeight: '800', color: theme.or, padding: 8 },
  prixSuffix:    { fontSize: 14, color: theme.txt2, fontWeight: '600' },
  prixHint:      { fontSize: 11, color: theme.txt2, marginTop: 8 },
  dureeGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dureeBtn:      { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: theme.bd, backgroundColor: theme.card2 },
  dureeBtnAct:   { backgroundColor: theme.bord, borderColor: theme.bord },
  dureeTxt:      { fontSize: 13, fontWeight: '600', color: theme.txt2 },
  dureeTxtAct:   { color: 'white' },
  dureeInfo:     { marginTop: 12, backgroundColor: theme.orl, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: theme.bd },
  dureeInfoTxt:  { fontSize: 12, color: theme.txt2 },
  recap:         { backgroundColor: theme.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: theme.or },
  recapTitre:    { fontSize: 12, fontWeight: '700', color: theme.or, textTransform: 'uppercase', marginBottom: 10 },
  recapRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  recapLabel:    { fontSize: 12, color: theme.txt2 },
  recapVal:      { fontSize: 12, color: theme.txt, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  btnPublier:    { backgroundColor: theme.or, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  btnPublierTxt: { fontSize: 16, fontWeight: '800', color: theme.isDark ? '#0E0A08' : '#FFFFFF' },
});
