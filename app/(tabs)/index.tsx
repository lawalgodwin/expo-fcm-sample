// App.js
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Platform, Text, View } from 'react-native';
import registerForPushNotificationsAsync from '../../notificationsSetup';

// Configure how notifications are shown when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: true,
  }),
});

export default function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((t) => {
        if (t) setToken(t);
      })
      .catch(console.error);

    // Listener for when a notification is received while the app is foregrounded
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received in foreground:', notification);
      });

    // Listener for user interacting with a notification (tap, etc)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('User interacted with notification:', response);
      });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Expo FCM native token demo</Text>
      <Text selectable style={{ marginTop: 12 }}>{token ?? 'No token yet'}</Text>
      <Button title="Send token to backend" onPress={() => sendTokenToServer(token)} disabled={!token}/>
    </View>
  );
}

async function sendTokenToServer(token:any) {
  if (!token) return Alert.alert('No token', 'Get the token before sending to server.');
  try {
    // send to backend endpoint
    await axios.post('https://pub-api.example.com/devices', {
      fcmToken: token,
      platform: Platform.OS,
      // any other identification, e.g. userId
    });
    Alert.alert('OK', 'Token sent to server');
  } catch (err) {
    console.error('Failed to send token', err);
    Alert.alert('Error', 'Failed to send token to server. See console.');
  }
}
