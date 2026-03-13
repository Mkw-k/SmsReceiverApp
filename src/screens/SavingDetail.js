import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { api } from '../utils/api';

const SavingDetail = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSavingData = async () => {
      try {
        const response = await api.get('/api/transactions/analysis/saving');
        setData(response.data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavingData();
  }, []);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(Math.abs(amount || 0)) + '원';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#48bb78" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>나의 절약 내역</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>이번 달 절약 상태</Text>
        <View style={styles.amountContainer}>
          <Text style={[styles.amountText, { color: data.savingAmount >= 0 ? '#48bb78' : '#f56565' }]}>
            {formatAmount(data.savingAmount)}
          </Text>
          <Text style={styles.subText}>{data.message}</Text>
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>상세 비교</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>지난달 동일 기간 지출</Text>
          <Text style={styles.infoValue}>{formatAmount(data.lastMonthSamePeriodAmount)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>이번 달 현재까지 지출</Text>
          <Text style={styles.infoValue}>{formatAmount(data.currentMonthAmount)}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a202c', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  card: { backgroundColor: '#2d3748', borderRadius: 20, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  amountContainer: { alignItems: 'center', marginVertical: 10 },
  amountText: { fontSize: 36, fontWeight: '900' },
  subText: { color: '#a0aec0', marginTop: 8, textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { color: '#a0aec0', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});

export default SavingDetail;
