// SavingDetail.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const SavingDetail = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>나의 절약 내역</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>이번 달 절약 금액</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>70,000원</Text>
          <Text style={styles.subText}>저번 달 대비 이만큼 아꼈어요!</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>절약 팁</Text>
        <Text style={styles.tipText}>- 식비 지출을 줄여보세요.</Text>
        <Text style={styles.tipText}>- 불필요한 구독 서비스를 해지하세요.</Text>
        <Text style={styles.tipText}>- 대중교통 이용을 습관화하세요.</Text>
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
  amountText: { fontSize: 36, fontWeight: '900', color: '#48bb78' },
  subText: { color: '#a0aec0', marginTop: 8 },
  tipText: { color: '#cbd5e0', fontSize: 14, marginBottom: 8 },
});

export default SavingDetail;
