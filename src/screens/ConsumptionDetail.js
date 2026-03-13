import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { api } from '../utils/api';

const ConsumptionDetail = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        const [transRes, statsRes] = await Promise.all([
          api.get('/api/transactions'),
          api.get('/api/transactions/statistics'),
        ]);

        setTransactions(transRes.data.content);

        // 그래프 데이터 변환
        const stats = statsRes.data.monthlySums;
        setChartData({
          labels: stats.map(s => s.month),
          datasets: [
            {
              data: stats.map(s => s.totalAmount / 10000), // 만원 단위로 표시
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              strokeWidth: 2
            }
          ],
          legend: ['월별 지출 (단위: 만원)']
        });
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailData();
  }, []);

  const chartConfig = {
    backgroundColor: '#1a202c',
    backgroundGradientFrom: '#2d3748',
    backgroundGradientTo: '#2d3748',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(203, 213, 224, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount || 0) + '원';
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
      <Text style={styles.title}>소비 상세내역</Text>

      {/* 최근 소비 목록 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>최근 소비 목록</Text>
        {transactions.length > 0 ? (
          transactions.map(item => (
            <View key={item.id} style={styles.transactionRow}>
              <Text style={styles.categoryIcon}>{item.isStupidCost ? '🤦' : '💳'}</Text>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionName}>{item.vendor}</Text>
                <Text style={styles.transactionDate}>{new Date(item.transactionTime).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.transactionAmount}>-{formatAmount(item.amount)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>내역이 없습니다.</Text>
        )}
      </View>

      {/* 그래프 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>월별 소비 현황</Text>
        {chartData && (
          <LineChart
            data={chartData}
            width={screenWidth - 72}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a202c', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  card: { backgroundColor: '#2d3748', borderRadius: 20, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  transactionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  categoryIcon: { fontSize: 24, marginRight: 12 },
  transactionInfo: { flex: 1 },
  transactionName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  transactionDate: { color: '#a0aec0', fontSize: 12 },
  transactionAmount: { color: '#f56565', fontWeight: 'bold', fontSize: 16 },
  emptyText: { color: '#a0aec0', textAlign: 'center' },
});

export default ConsumptionDetail;
