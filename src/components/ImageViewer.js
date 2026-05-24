import React, { useState } from 'react';
import {
  View, Image, Modal, TouchableOpacity, ScrollView,
  Dimensions, Text, StatusBar
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ImageViewer({ photos, style, defaultEmoji = '📦' }) {
  const [modalVisible,  setModalVisible]  = useState(false);
  const [indexActuel,   setIndexActuel]   = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ fontSize: 60 }}>{defaultEmoji}</Text>
      </View>
    );
  }

  return (
    <>
      {/* IMAGE PRINCIPALE CLIQUABLE */}
      <TouchableOpacity
        style={style}
        onPress={() => { setIndexActuel(0); setModalVisible(true); }}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: photos[0] }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* BADGE NOMBRE DE PHOTOS */}
        {photos.length > 1 && (
          <View style={{
            position: 'absolute', bottom: 10, right: 10,
            backgroundColor: 'rgba(0,0,0,0.6)',
            paddingHorizontal: 10, paddingVertical: 4,
            borderRadius: 20
          }}>
            <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>
              📷 {photos.length}
            </Text>
          </View>
        )}

        {/* MINIATURES */}
        {photos.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ position: 'absolute', bottom: 10, left: 10 }}
          >
            {photos.slice(1).map((photo, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => { setIndexActuel(i + 1); setModalVisible(true); }}
              >
                <Image
                  source={{ uri: photo }}
                  style={{ width: 40, height: 40, borderRadius: 6, marginRight: 6, borderWidth: 1.5, borderColor: 'white' }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </TouchableOpacity>

      {/* MODAL PLEIN ECRAN */}
      <Modal visible={modalVisible} transparent animationType="fade" statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: 'black' }}>

          {/* BOUTON FERMER */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 16, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>

          {/* COMPTEUR */}
          <View style={{ position: 'absolute', top: 54, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
              {indexActuel + 1} / {photos.length}
            </Text>
          </View>

          {/* SCROLL HORIZONTAL PLEIN ECRAN */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setIndexActuel(index);
            }}
            contentOffset={{ x: indexActuel * width, y: 0 }}
            style={{ flex: 1 }}
          >
            {photos.map((photo, i) => (
              <View key={i} style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri: photo }}
                  style={{ width, height }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* POINTS INDICATEURS */}
          {photos.length > 1 && (
            <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === indexActuel ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: i === indexActuel ? 'white' : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
