import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { api } from '../utils/api';

const StupidExpenseDetail = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [totalStupid, setTotalStupid] = useState(0);

  useEffect(() => {
    const fetchStupidData = async () => {
      try {
        const response = await api.get('/api/transactions?isStupid=true');
        const content = response.data.content;
        setExpenses(content);
        
        const sum = content.reduce((acc, curr) => acc + curr.amount, 0);
        setTotalStupid(sum);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStupidData();
  }, []);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount || 0) + '원';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#f56565" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>멍청비용 상세 내역</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>최근 멍청비용 내역</Text>
        {expenses.length > 0 ? (
          expenses.map(item => (
            <View key={item.id} style={styles.expenseRow}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseName}>{item.vendor}</Text>
                <Text style={styles.expenseDate}>{new Date(item.transactionTime).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.expenseAmount}>-{formatAmount(item.amount)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>멍청비용 내역이 없습니다. 아주 훌륭해요! 👍</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>이번 달 멍청비용 총합</Text>
        <View style={styles.totalContainer}>
          <Text style={styles.totalAmount}>{formatAmount(totalStupid)}</Text>
          <Text style={styles.subText}>이번 달에 아낄 수 있었던 금액입니다.</Text>
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
  emptyText: { color: '#a0aec0', textAlign: 'center', paddingVertical: 20 },
});

export default StupidExpenseDetail;
