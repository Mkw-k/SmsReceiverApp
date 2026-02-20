import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const MainScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* 내 계좌 섹션 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>내 계좌</Text>
        <View style={styles.row}>
          <Text style={styles.bankName}>하나은행</Text>
          <Text style={styles.bankAmount}>1,250,000원</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.bankName}>카카오뱅크</Text>
          <Text style={styles.bankAmount}>50,000원</Text>
        </View>
      </View>

      {/* SSDMA 지갑 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SSDMA 지갑</Text>
        <View style={styles.row}>
          <Text style={styles.walletLabel}>SSDMA 포인트</Text>
          <Text style={styles.walletAmount}>1,000P</Text>
        </View>
      </View>

      {/* 소비현황 섹션 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>소비현황</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>이번 달 총 지출</Text>
          <Text style={styles.summaryValue}>380,000원</Text>
        </View>
        
        {/* 카드별 간단 요약 */}
        <View style={styles.cardSummary}>
          <Text style={styles.smallLabel}>신한카드</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '53%' }]} />
          </View>
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
          <Text style={[styles.statusText, { color: '#48bb78' }]}>70,000원 절약 중</Text>
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
          <Text style={[styles.statusText, { color: '#f56565' }]}>17,600원</Text>
        </View>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a202c',
    padding: 16,
  },
  card: {
    backgroundColor: '#2d3748',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bankName: {
    color: '#a0aec0',
    fontSize: 14,
    flex: 1,
  },
  bankAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  walletLabel: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  walletAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'between',
    marginBottom: 16,
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSummary: {
    marginBottom: 12,
  },
  smallLabel: {
    color: '#cbd5e0',
    fontSize: 12,
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#4a5568',
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#9f7aea',
    borderRadius: 4,
  },
  detailButton: {
    backgroundColor: '#3182ce',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subText: {
    color: '#a0aec0',
    fontSize: 14,
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MainScreen;
