import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../utils/api';

const SavingDetail = () => {
  const [target, setTarget] = useState('1000000');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async (targetValue) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/transactions/analysis/savings?target=${targetValue}`);
      setAnalysis(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(target);
  }, []);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount || 0) + '원';
  };

  const handleTargetChange = (val) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setTarget(cleaned);
  };

  const onApply = () => {
    fetchAnalysis(target);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>💰 저축 목표 설정</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={target}
            onChangeText={handleTargetChange}
            placeholder="목표 금액 입력"
            placeholderTextColor="#a0aec0"
          />
          <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
            <Text style={styles.applyBtnText}>분석</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>이번 달에 얼마를 모으고 싶으신가요?</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3182ce" style={{ marginTop: 50 }} />
      ) : analysis && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>분석 리포트</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>최대 저축 가능 금액</Text>
              <Text style={styles.statValue}>{formatAmount(analysis.maxPossibleSavings)}</Text>
            </View>
            <Text style={styles.statDesc}>(총 수입 {formatAmount(analysis.income)} - 고정 지출 {formatAmount(analysis.fixedExpense)})</Text>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>현재 예상 저축액</Text>
              <Text style={[styles.statValue, { color: '#4299e1' }]}>{formatAmount(analysis.currentSavings)}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>목표 저축액</Text>
              <Text style={styles.statValue}>{formatAmount(analysis.targetSavings)}</Text>
            </View>

            <View style={styles.gapContainer}>
              <Text style={styles.gapLabel}>{analysis.gap > 0 ? '부족한 금액' : '초과 달성 금액'}</Text>
              <Text style={[styles.gapValue, { color: analysis.gap > 0 ? '#f56565' : '#48bb78' }]}>
                {formatAmount(Math.abs(analysis.gap))}
              </Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: '#2b6cb0' }]}>
            <Text style={styles.cardTitle}>💡 절약 가이드</Text>
            <Text style={styles.recommendation}>{analysis.recommendation}</Text>
            
            {analysis.stupidExpense > 0 && (
              <View style={styles.stupidHighlight}>
                <Text style={styles.stupidText}>
                  이번 달 멍청비용 {formatAmount(analysis.stupidExpense)}만 줄여도 목표 달성 확률이 크게 높아집니다!
                </Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>지출 세부 내역</Text>
            <View style={styles.row}>
              <Text style={styles.label}>필수 고정 지출</Text>
              <Text style={styles.value}>{formatAmount(analysis.fixedExpense)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>변동 지출 (일반)</Text>
              <Text style={styles.value}>{formatAmount(analysis.variableExpense - analysis.stupidExpense)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>멍청 비용</Text>
              <Text style={[styles.value, { color: '#f56565' }]}>{formatAmount(analysis.stupidExpense)}</Text>
            </View>
          </View>
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a202c', padding: 16 },
  headerCard: { backgroundColor: '#2d3748', borderRadius: 20, padding: 20, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#1a202c', color: '#fff', borderRadius: 12, padding: 15, fontSize: 18, fontWeight: 'bold' },
  applyBtn: { backgroundColor: '#3182ce', padding: 15, borderRadius: 12, marginLeft: 10 },
  applyBtnText: { color: '#fff', fontWeight: 'bold' },
  hint: { color: '#a0aec0', marginTop: 10, fontSize: 13 },
  card: { backgroundColor: '#2d3748', borderRadius: 20, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  statLabel: { color: '#a0aec0', fontSize: 14 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statDesc: { color: '#718096', fontSize: 12, marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#4a5568', marginVertical: 15 },
  gapContainer: { marginTop: 10, alignItems: 'center', backgroundColor: '#1a202c', padding: 15, borderRadius: 15 },
  gapLabel: { color: '#a0aec0', fontSize: 14, marginBottom: 5 },
  gapValue: { fontSize: 24, fontWeight: 'bold' },
  recommendation: { color: '#fff', fontSize: 16, lineHeight: 24 },
  stupidHighlight: { marginTop: 15, backgroundColor: 'rgba(245, 101, 101, 0.2)', padding: 12, borderRadius: 10 },
  stupidText: { color: '#feb2b2', fontSize: 14, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: '#a0aec0', fontSize: 15 },
  value: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default SavingDetail;
