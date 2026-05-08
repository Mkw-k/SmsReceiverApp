import React, { useEffect, useState } from 'react';
import { 
  NativeEventEmitter, 
  NativeModules, 
  Platform, 
  PermissionsAndroid, 
  TouchableOpacity, 
  Text as RNText,
  Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import { api } from './src/utils/api';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import MainScreen from './src/screens/MainScreen';
import ConsumptionDetail from './src/screens/ConsumptionDetail';
import SavingDetail from './src/screens/SavingDetail';
import StupidExpenseDetail from './src/screens/StupidExpenseDetail';
import MyPageScreen from './src/screens/MyPageScreen';

const { SmsReceiver } = NativeModules;
const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const setupSmsListener = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS);
        if (Platform.Version >= 33) {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }
      }

      // Firebase FCM 설정
      const requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);
          const token = await messaging().getToken();
          console.log('FCM Token:', token);
          
          if (Platform.OS === 'ios') {
            Alert.alert('iOS FCM Token', token);
          }
          
          // [자동 테스트] 본인 기기로 테스트 푸시 전송 (임시)
          console.log('Starting automated self-push test...');
          try {
            // 이 경로는 백엔드에 테스트용 API가 있다고 가정하거나, 
            // 단순히 로그로 성공 여부를 확인하기 위함입니다.
            // 실제 FCM 발송은 서버(Node.js/Java)에서 수행해야 하므로 
            // 여기서는 서버에 등록 요청을 보내는 것으로 테스트를 갈음합니다.
            await api.post('/api/devices/register', {
              token: token,
              platform: Platform.OS,
              loginId: 'mkw11'
            });
            console.log('Self-push test: Device registered successfully');
          } catch (e) {
            console.error('Self-push test failed:', e);
          }
        }
      };

      await requestUserPermission();

      // 포그라운드 메시지 처리 (앱이 켜져 있을 때)
      const unsubscribeMessaging = messaging().onMessage(async remoteMessage => {
        console.log('FCM Message Received:', remoteMessage);
        Alert.alert(
          remoteMessage.notification?.title || '알림',
          remoteMessage.notification?.body || '메시지가 도착했습니다.',
          [{ text: '확인' }]
        );
      });

      // 백그라운드/종료 상태에서 알림을 클릭해 들어온 경우 처리
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification caused app to open from background:', remoteMessage);
      });

      const eventEmitter = new NativeEventEmitter(SmsReceiver);
      const subscription = eventEmitter.addListener('SmsReceived', async (event) => {
        console.log('SMS Received in App:', event);
        
        try {
          // 서버로 SMS 정보 전송
          await api.post('/api/transactions/sms', {
            sender: event.sender,
            message: event.message
          });
          console.log('SMS data sent to server successfully');
        } catch (error) {
          console.error('Failed to send SMS to server:', error);
        }

        Alert.alert(
          'SMS 수신 알림',
          `보낸 사람: ${event.sender}\n내용: ${event.message}`,
          [{ text: '확인' }]
        );
      });

      return () => subscription.remove();
    };

    setupSmsListener();

    const timer = setTimeout(() => {
      setIsReady(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isLoggedIn ? "Main" : "Auth"}
        screenOptions={{
          headerStyle: { backgroundColor: '#1a202c' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Main" 
          component={MainScreen} 
          options={({ navigation }) => ({ 
            title: 'SSDMA',
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('MyPage')} style={{ marginRight: 10 }}>
                <RNText style={{ color: '#fff', fontWeight: 'bold' }}>마이</RNText>
              </TouchableOpacity>
            )
          })} 
        />
        <Stack.Screen 
          name="ConsumptionDetail" 
          component={ConsumptionDetail} 
          options={{ title: '소비 상세' }} 
        />
        <Stack.Screen 
          name="SavingDetail" 
          component={SavingDetail} 
          options={{ title: '절약 내역' }} 
        />
        <Stack.Screen 
          name="StupidExpenseDetail" 
          component={StupidExpenseDetail} 
          options={{ title: '멍청비용' }} 
        />
        <Stack.Screen 
          name="MyPage" 
          component={MyPageScreen} 
          options={{ title: '마이 페이지' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
