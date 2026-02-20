import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const ConsumptionDetail = () => {
  const screenWidth = Dimensions.get('window').width;

  const chartData = {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
    datasets: [
      {
        data: [35, 41, 29, 55, 32, 47],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // 이번 년도
        strokeWidth: 2
      },
      {
        data: [30, 35, 42, 48, 29, 40],
        color: (opacity = 1) => `rgba(167, 139, 250, ${opacity})`, // 작년
        strokeWidth: 2
      }
    ],
    legend: ['이번 년도', '작년']
  };

  const chartConfig = {
    backgroundColor: '#1a202c',
    backgroundGradientFrom: '#2d3748',
    backgroundGradientTo: '#2d3748',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(203, 213, 224, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726'
    }
  };

  const transactions = [
    { id: 1, name: '온라인 쇼핑', category: '🛍️', date: '2024.10.27', amount: '-12,500원' },
    { id: 2, name: '점심 식사', category: '🍔', date: '2024.10.27', amount: '-8,000원' },
    { id: 3, name: '커피', category: '☕', date: '2024.10.27', amount: '-4,500원' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>소비 상세내역</Text>

      {/* 최근 소비 목록 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>최근 소비 목록</Text>
        {transactions.map(item => (
          <View key={item.id} style={styles.transactionRow}>
            <Text style={styles.categoryIcon}>{item.category}</Text>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionName}>{item.name}</Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
            <Text style={styles.transactionAmount}>{item.amount}</Text>
          </View>
        ))}
      </View>

      {/* 그래프 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>월별 소비 비교</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 72}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a202c',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#2d3748',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  transactionDate: {
    color: '#a0aec0',
    fontSize: 12,
  },
  transactionAmount: {
    color: '#f56565',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ConsumptionDetail;
