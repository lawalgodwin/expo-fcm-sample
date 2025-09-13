// notificationsSetup.js
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

/**
 * Requests notification permission and returns the raw native token string
 * for FCM (Android) or APNs (iOS). If not possible, returns null.
 * NOTE: Notifications.getDevicePushTokenAsync() returns an object { type, data }.
 */
export default async function registerForPushNotificationsAsync() {
  try {
    if (!Device.isDevice) {
      console.warn('Must use a physical device for push notifications');
      return null;
    }

    // Request permissions (iOS will prompt; Android will auto-grant but Android 13+ apps
    // must still request runtime POST_NOTIFICATIONS via the permissions API if needed)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Permission not granted for notifications');
      return null;
    }

    // Get native device token (FCM token on Android; APNs token on iOS)
    const tokenObject = await Notifications.getDevicePushTokenAsync();
    // tokenObject example: { type: 'fcm', data: 'raw-token-string' }
    if (!tokenObject || !tokenObject.data) {
      console.warn('Failed to get device token object', tokenObject);
      return null;
    }

    console.log('Native device token object:', tokenObject);
    // return only the raw token string (tokenObject.data)
    return tokenObject.data;
  } catch (e) {
    console.error('Error getting push token', e);
    return null;
  }
}
