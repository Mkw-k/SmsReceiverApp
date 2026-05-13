import React, { useEffect, useState, useRef } from 'react';
import { 
  Platform, 
  PermissionsAndroid, 
  Alert,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  BackHandler
} from 'react-native';
import { WebView } from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';
import SplashScreen from './src/screens/SplashScreen';

const WEB_URL = 'https://www.save-time.kro.kr/sms-monitor/'; // Update this to your web app URL

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const setup = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS);
        if (Platform.Version >= 33) {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }
      }

      // FCM setup
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      // We can pass this token to the WebView if needed
      // webViewRef.current?.postMessage(JSON.stringify({ type: 'TOKEN', token }));

      const unsubscribeMessaging = messaging().onMessage(async remoteMessage => {
        console.log('FCM Message Received:', remoteMessage);
        // We can pass the notification to the webview to show in-app notification
        webViewRef.current?.postMessage(JSON.stringify({ 
          type: 'NOTIFICATION', 
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body 
        }));
      });

      return () => unsubscribeMessaging();
    };

    setup();

    const backAction = () => {
      if (canGoBack) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
      backHandler.remove();
    };
  }, [canGoBack]);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        style={styles.webview}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onMessage={(event) => {
          // Handle messages from WebView to Native if needed
          const data = JSON.parse(event.nativeEvent.data);
          console.log('Message from WebView:', data);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
});
