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
          // TODO: 이 토큰을 서버에 저장하는 API 호출 필요
        }
      };

      await requestUserPermission();

      // 포그라운드 메시지 처리
      const unsubscribeMessaging = messaging().onMessage(async remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
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
