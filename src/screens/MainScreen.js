import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { api } from '../utils/api';

const MainScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({ monthlyTotalAmount: 0, monthlyStupidCostAmount: 0, month: '-' });
  const [accounts, setAccounts] = useState([]);
  const [userInfo, setUserInfo] = useState({ point: 0 });

  const fetchData = async () => {
    try {
      const [summaryRes, accountsRes, profileRes] = await Promise.all([
        api.get('/api/transactions/summary'),
        api.get('/api/accounts'),
        api.get('/api/users/me'),
      ]);

      setSummary(summaryRes.data);
      setAccounts(accountsRes.data);
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
      {/* 내 계좌 섹션 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>내 계좌</Text>
        {accounts.length > 0 ? (
          accounts.map((acc) => (
            <View key={acc.id} style={styles.row}>
              <Text style={styles.bankName}>{acc.bankName}</Text>
              <Text style={styles.bankAmount}>{formatAmount(acc.balance)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>등록된 계좌가 없습니다.</Text>
        )}
      </View>

      {/* SSDMA 지갑 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SSDMA 지갑</Text>
        <View style={styles.row}>
          <Text style={styles.walletLabel}>SSDMA 포인트</Text>
          <Text style={styles.walletAmount}>{summary ? userInfo.point : 0}P</Text>
        </View>
      </View>

      {/* 소비현황 섹션 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>소비현황 ({summary.month})</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>이번 달 총 지출</Text>
          <Text style={styles.summaryValue}>{formatAmount(summary.monthlyTotalAmount)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.detailButton}
          onPress={() => navigation.navigate('ConsumptionDetail')}
        >
          <Text style={styles.detailButtonText}>상세내역 보기</Text>
        </TouchableOpacity>
      </View>

      {/* 나의 절약 내역 */}
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('SavingDetail')}
      >
        <Text style={styles.cardTitle}>나의 절약 내역</Text>
        <View style={styles.row}>
          <Text style={styles.subText}>저번 달 대비</Text>
          <Text style={[styles.statusText, { color: '#48bb78' }]}>상세보기</Text>
        </View>
      </TouchableOpacity>

      {/* 멍청비용 */}
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('StupidExpenseDetail')}
      >
        <Text style={styles.cardTitle}>멍청비용</Text>
        <View style={styles.row}>
          <Text style={styles.subText}>이번 달</Text>
          <Text style={[styles.statusText, { color: '#f56565' }]}>{formatAmount(summary.monthlyStupidCostAmount)}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a202c', padding: 16 },
  card: { backgroundColor: '#2d3748', borderRadius: 20, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bankName: { color: '#a0aec0', fontSize: 14, flex: 1 },
  bankAmount: { color: '#fff', fontSize: 16, fontWeight: '600' },
  walletLabel: { color: '#fff', fontSize: 16, flex: 1 },
  walletAmount: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryLabel: { color: '#fff', fontSize: 16, flex: 1 },
  summaryValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  detailButton: { backgroundColor: '#3182ce', borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 12 },
  detailButtonText: { color: '#fff', fontWeight: 'bold' },
  subText: { color: '#a0aec0', fontSize: 14, flex: 1 },
  statusText: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { color: '#a0aec0', textAlign: 'center' },
});

export default MainScreen;
