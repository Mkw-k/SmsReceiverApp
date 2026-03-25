import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { api } from '../utils/api';

const MainScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({ 
    monthlyTotalAmount: 0, 
    monthlyTotalIncome: 0, 
    monthlyStupidCostAmount: 0, 
    month: '-' 
  });
  const [userInfo, setUserInfo] = useState({ point: 0 });

  const fetchData = async () => {
    try {
      const [summaryRes, profileRes] = await Promise.all([
        api.get('/api/transactions/summary'),
        api.get('/api/users/me'),
      ]);

      setSummary(summaryRes.data);
      setUserInfo(profileRes.data);
    } catch (error) {
      console.error('Data fetching error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount || 0) + '원';
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
    >
      {/* 이번 달 요약 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{summary.month} 자산 현황</Text>
        <View style={styles.row}>
          <Text style={styles.label}>총 수입</Text>
          <Text style={[styles.value, { color: '#48bb78' }]}>{formatAmount(summary.monthlyTotalIncome)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>총 지출</Text>
          <Text style={[styles.value, { color: '#f56565' }]}>{formatAmount(summary.monthlyTotalAmount)}</Text>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#4a5568', marginTop: 10, paddingTop: 10 }]}>
          <Text style={styles.label}>순 자산 증감</Text>
          <Text style={[styles.value, { fontSize: 20 }]}>
            {formatAmount(summary.monthlyTotalIncome - summary.monthlyTotalAmount)}
          </Text>
        </View>
      </View>

      {/* 저축 플래너 바로가기 (신규) */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: '#3182ce' }]}
        onPress={() => navigation.navigate('SavingDetail')} // SavingDetail을 저축 플래너로 활용하거나 새로 연결
      >
        <Text style={[styles.cardTitle, { marginBottom: 4 }]}>💰 저축 플래너</Text>
        <Text style={{ color: '#ebf8ff', fontSize: 14 }}>목표 저축액을 달성할 수 있을까요? 분석받기</Text>
      </TouchableOpacity>

      {/* 소비 상세 내역 */}
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ConsumptionDetail')}
      >
        <Text style={styles.cardTitle}>소비 상세 내역</Text>
        <View style={styles.row}>
          <Text style={styles.subText}>이번 달 지출 내역을 확인하고 직접 등록하세요.</Text>
          <Text style={styles.linkText}>보기</Text>
        </View>
      </TouchableOpacity>

      {/* 멍청비용 관리 */}
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('StupidExpenseDetail')}
      >
        <Text style={styles.cardTitle}>멍청비용 리포트</Text>
        <View style={styles.row}>
          <Text style={styles.subText}>아낄 수 있었던 금액</Text>
          <Text style={[styles.statusText, { color: '#f56565' }]}>{formatAmount(summary.monthlyStupidCostAmount)}</Text>
        </View>
      </TouchableOpacity>

      {/* SSDMA 지갑 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SSDMA 지갑</Text>
        <View style={styles.row}>
          <Text style={styles.walletLabel}>보유 포인트</Text>
          <Text style={styles.walletAmount}>{userInfo.point} P</Text>
        </View>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a202c', padding: 16 },
  card: { backgroundColor: '#2d3748', borderRadius: 20, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { color: '#a0aec0', fontSize: 15 },
  value: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  subText: { color: '#a0aec0', fontSize: 14, flex: 1 },
  linkText: { color: '#4299e1', fontWeight: 'bold' },
  statusText: { fontSize: 16, fontWeight: 'bold' },
  walletLabel: { color: '#fff', fontSize: 16, flex: 1 },
  walletAmount: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default MainScreen;
