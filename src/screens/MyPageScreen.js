import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { api, setToken } from '../utils/api';

const MyPageScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/users/me');
        setUser(response.data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    setToken(null);
    navigation.replace('Auth');
  };

  const handlePushTest = async () => {
    console.log('[Push Test] Button Pressed');
    setPushLoading(true);
    try {
      // 1. 현재 기기의 FCM 토큰 가져오기
      const token = await messaging().getToken();
      console.log('[Push Test] Current Token:', token);
      
      // 토큰을 화면에 즉시 보여줌 (작동 확인용)
      Alert.alert('FCM 토큰 확인', `토큰을 성공적으로 가져왔습니다.\n\n${token.substring(0, 50)}...`, [
        {
          text: '서버로 전송',
          onPress: async () => {
            try {
              // 2. 서버에 테스트 푸시 요청 (사용자 지정 엔드포인트)
              console.log('[Push Test] Calling test-push endpoint...');
              const response = await api.post(`/api/transactions/test-push?token=${token}&title=푸시 테스트`, {});

              console.log('[Push Test] Server Response:', response);
              Alert.alert('성공', `테스트 푸시가 요청되었습니다.\n서버 응답: ${response.message || 'Success'}`);
            } catch (serverError) {
              console.error('[Push Test] Server Error:', serverError);
              Alert.alert('서버 전송 실패', serverError.message);
            }
          }
        },
        { text: '취소', style: 'cancel' }
      ]);

    } catch (error) {
      console.error('[Push Test] Token Error:', error);
      Alert.alert('토큰 오류', `FCM 토큰을 가져오지 못했습니다: ${error.message}`);
    } finally {
      setPushLoading(false);
    }
  };

  const handleShowToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('[Token Check] Current Token:', token);
      Alert.alert(
        'FCM 토큰 (복사용)',
        token,
        [
          { text: '확인', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('오류', '토큰을 가져오지 못했습니다.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>마이 페이지</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>사용자 정보</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>사용자 ID</Text>
          <Text style={styles.infoValue}>{user.loginId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>가입일</Text>
          <Text style={styles.infoValue}>{new Date(user.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>회원 등급</Text>
          <Text style={styles.infoValue}>{user.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>보유 포인트</Text>
          <Text style={[styles.infoValue, { color: '#ecc94b' }]}>{user.point}P</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>설정</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>알림 설정</Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <TouchableOpacity 
            style={[styles.menuButton, { backgroundColor: '#3182ce', borderRadius: 8, borderBottomWidth: 0, paddingVertical: 12, flex: 1, marginRight: 5 }]} 
            onPress={handlePushTest}
            disabled={pushLoading}
          >
            {pushLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.menuText, { textAlign: 'center', fontWeight: 'bold', fontSize: 13 }]}>푸시 테스트</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuButton, { backgroundColor: '#4a5568', borderRadius: 8, borderBottomWidth: 0, paddingVertical: 12, flex: 1, marginLeft: 5 }]} 
            onPress={handleShowToken}
          >
            <Text style={[styles.menuText, { textAlign: 'center', fontWeight: 'bold', fontSize: 13 }]}>토큰 확인</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>버전 정보 (0.0.1)</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a202c', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  card: { backgroundColor: '#2d3748', borderRadius: 20, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { color: '#a0aec0', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  menuButton: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#4a5568' },
  menuText: { color: '#fff', fontSize: 16 },
  logoutButton: { backgroundColor: '#f56565', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default MyPageScreen;
