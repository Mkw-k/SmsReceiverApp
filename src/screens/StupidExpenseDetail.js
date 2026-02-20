import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const StupidExpenseDetail = () => {
  const expenses = [
    { id: 1, name: '편의점 군것질', date: '2024.10.27', amount: '-2,100원' },
    { id: 2, name: '배달비', date: '2024.10.26', amount: '-3,000원' },
    { id: 3, name: '불필요한 구독료', date: '2024.10.25', amount: '-8,000원' },
    { id: 4, name: '새벽 배송', date: '2024.10.24', amount: '-4,500원' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>멍청비용 상세 내역</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>최근 멍청비용 내역</Text>
        {expenses.map(item => (
          <View key={item.id} style={styles.expenseRow}>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseName}>{item.name}</Text>
              <Text style={styles.expenseDate}>{item.date}</Text>
            </View>
            <Text style={styles.expenseAmount}>{item.amount}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>멍청비용 총합</Text>
        <View style={styles.totalContainer}>
          <Text style={styles.totalAmount}>17,600원</Text>
          <Text style={styles.subText}>지금까지 누적된 멍청비용입니다.</Text>
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
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  expenseInfo: { flex: 1 },
  expenseName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  expenseDate: { color: '#a0aec0', fontSize: 12 },
  expenseAmount: { color: '#f56565', fontWeight: 'bold', fontSize: 16 },
  totalContainer: { alignItems: 'center', marginVertical: 10 },
  totalAmount: { fontSize: 36, fontWeight: '900', color: '#f56565' },
  subText: { color: '#a0aec0', marginTop: 8 },
});

export default StupidExpenseDetail;
