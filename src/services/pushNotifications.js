import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function enregistrerPourNotifications() {
  if (!Device.isDevice) {
    console.log('Les notifications push nécessitent un vrai appareil.');
    return null;
  }

  const { status: statutExistant } = await Notifications.getPermissionsAsync();
  let statutFinal = statutExistant;

  if (statutExistant !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    statutFinal = status;
  }

  if (statutFinal !== 'granted') {
    console.log('Permission de notification refusée.');
    return null;
  }

  try {
    const tokenData = await Notifications.getDevicePushTokenAsync();
    const token = tokenData.data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    await api.post('/auth/fcm-token', { token, plateforme: Platform.OS });
    console.log('✅ Token FCM enregistré.');
    return token;
  } catch (err) {
    console.error('Erreur enregistrement token push:', err.message);
    return null;
  }
}
