import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function EvaluationModal({ visible, onClose, evalueId, evalueNom, donId, donTitre, onSuccess }) {
  const { theme } = useTheme();
  const [note,        setNote]        = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [loading,     setLoading]     = useState(false);

  const LABELS = ['', 'Très déçu', 'Déçu', 'Correct', 'Très bien', 'Excellent !'];

  const handleEnvoyer = async () => {
    if (note === 0) {
      return Alert.alert('Note requise', 'Veuillez sélectionner une note de 1 à 5 étoiles.');
    }
    setLoading(true);
    try {
      await api.post('/evaluations', {
        evalue_id:   evalueId,
        don_id:      donId,
        note,
        commentaire: commentaire.trim() || null,
      });
      setNote(0);
      setCommentaire('');
      onClose();
      Alert.alert('✅ Merci !', 'Votre évaluation a été enregistrée.');
      if (onSuccess) onSuccess();
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={{ backgroundColor: theme.card, borderRadius: 24, padding: 20, paddingBottom: 36 }}>
          <View style={{ width: 36, height: 4, backgroundColor: theme.bd, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.txt, marginBottom: 4 }}>⭐ Évaluer {evalueNom}</Text>
          <Text style={{ fontSize: 13, color: theme.txt2, marginBottom: 20 }}>Don : {donTitre}</Text>

          {/* ETOILES */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setNote(n)}>
                <Text style={{ fontSize: 40, opacity: n <= note ? 1 : 0.25 }}>⭐</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* LABEL */}
          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '700', color: note > 0 ? theme.or : theme.txt3, marginBottom: 20, height: 20 }}>
            {LABELS[note]}
          </Text>

          {/* COMMENTAIRE */}
          <TextInput
            style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 12, padding: 12, fontSize: 14, color: theme.txt, height: 80, textAlignVertical: 'top', marginBottom: 16 }}
            placeholder="Commentaire (optionnel)..."
            placeholderTextColor={theme.txt3}
            value={commentaire}
            onChangeText={setCommentaire}
            multiline
            maxLength={300}
          />

          {/* BOUTONS */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: theme.card2, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.bd }}
              onPress={onClose}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.txt2 }}>Plus tard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 2, backgroundColor: theme.or, borderRadius: 12, padding: 14, alignItems: 'center', opacity: note === 0 ? 0.5 : 1 }}
              onPress={handleEnvoyer}
              disabled={loading || note === 0}
            >
              {loading
                ? <ActivityIndicator color="#0E0A08" />
                : <Text style={{ fontSize: 14, fontWeight: '700', color: '#0E0A08' }}>⭐ Envoyer</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
