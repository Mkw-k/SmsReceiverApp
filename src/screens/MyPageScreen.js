import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { api, setToken } from '../utils/api';

const MyPageScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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

  const handleLogout = async () => {
    await setToken(null);
    navigation.replace('Auth');
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
