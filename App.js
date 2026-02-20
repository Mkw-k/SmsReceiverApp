import React, { useEffect, useState } from 'react';
import { 
  NativeEventEmitter, 
  NativeModules, 
  Platform, 
  PermissionsAndroid, 
  TouchableOpacity, 
  Text as RNText 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
      }

      const eventEmitter = new NativeEventEmitter(SmsReceiver);
      const subscription = eventEmitter.addListener('SmsReceived', (event) => {
        console.log('SMS Received in App:', event);
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
