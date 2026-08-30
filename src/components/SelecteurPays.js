import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PAYS } from '../data/pays';

export default function SelecteurPays({ paysSelectionne, onChange }) {
  const { theme } = useTheme();
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOuvert(true)}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          backgroundColor: theme.inp, borderWidth: 1, borderColor: theme.bd,
          borderRadius: 11, paddingHorizontal: 12, paddingVertical: 12,
        }}
      >
        <Text style={{ fontSize: 16 }}>{paysSelectionne.drapeau}</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.txt }}>{paysSelectionne.indicatif}</Text>
        <Text style={{ fontSize: 10, color: theme.txt2 }}>▼</Text>
      </TouchableOpacity>

      <Modal visible={ouvert} transparent animationType="slide" onRequestClose={() => setOuvert(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setOuvert(false)}
        >
          <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingTop: 16, paddingBottom: 30 }}>
            <View style={{ width: 36, height: 4, backgroundColor: theme.bd, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: theme.txt, textAlign: 'center', marginBottom: 12 }}>Choisir un pays</Text>
            <FlatList
              data={PAYS}
              keyExtractor={(p) => p.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { onChange(item); setOuvert(false); }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 12 }}
                >
                  <Text style={{ fontSize: 18 }}>{item.drapeau}</Text>
                  <Text style={{ flex: 1, fontSize: 14, color: theme.txt }}>{item.nom}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.txt2 }}>{item.indicatif}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
