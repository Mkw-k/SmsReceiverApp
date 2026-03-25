import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Switch, Alert } from 'react-native';
import { api } from '../utils/api';

const ConsumptionDetail = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [form, setForm] = useState({
    amount: '',
    vendor: '',
    type: 'EXPENSE',
    isStupidCost: false,
    isFixedExpense: false,
    isIgnored: false,
    memo: '',
  });

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/api/transactions?size=50');
      setTransactions(res.data.content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleUpdate = async () => {
    try {
      await api.put(`/api/transactions/${selectedItem.id}`, {
        isStupidCost: form.isStupidCost,
        isFixedExpense: form.isFixedExpense,
        isIgnored: form.isIgnored,
        memo: form.memo,
      });
      setEditModalVisible(false);
      fetchTransactions();
    } catch (error) {
      Alert.alert('오류', '수정에 실패했습니다.');
    }
  };

  const handleAdd = async () => {
    try {
      await api.post('/api/transactions', {
        ...form,
        amount: parseFloat(form.amount),
        transactionTime: new Date().toISOString(),
      });
      setAddModalVisible(false);
      fetchTransactions();
      setForm({ amount: '', vendor: '', type: 'EXPENSE', isStupidCost: false, isFixedExpense: false, isIgnored: false, memo: '' });
    } catch (error) {
      Alert.alert('오류', '등록에 실패했습니다.');
    }
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setForm({
      isStupidCost: item.stupidCost,
      isFixedExpense: item.fixedExpense,
      isIgnored: item.manual === undefined ? item.ignored : item.ignored, // 데이터 구조 확인
      memo: item.memo || '',
    });
    setEditModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.item, item.ignored && { opacity: 0.4 }]} 
      onPress={() => openEdit(item)}
    >
      <View style={styles.itemHeader}>
        <View>
          <Text style={styles.vendor}>{item.vendor}</Text>
          {item.ignored && <Text style={styles.ignoreText}>(계산에서 제외됨)</Text>}
        </View>
        <Text style={[styles.amount, { color: item.type === 'INCOME' ? '#48bb78' : '#f56565' }]}>
          {item.type === 'INCOME' ? '+' : '-'}{new Intl.NumberFormat('ko-KR').format(item.amount)}원
        </Text>
      </View>
      <View style={styles.itemFooter}>
        <Text style={styles.date}>{new Date(item.transactionTime).toLocaleDateString()}</Text>
        <View style={styles.badgeContainer}>
          {item.stupidCost && <View style={[styles.badge, { backgroundColor: '#f56565' }]}><Text style={styles.badgeText}>멍청</Text></View>}
          {item.fixedExpense && <View style={[styles.badge, { backgroundColor: '#4299e1' }]}><Text style={styles.badgeText}>고정</Text></View>}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={fetchTransactions}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>내역 관리</Text>
            
            <View style={styles.switchRow}>
              <Text style={styles.label}>이 내역 무시하기 (계산 제외)</Text>
              <Switch value={form.isIgnored} onValueChange={(v) => setForm({...form, isIgnored: v})} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>멍청비용 여부</Text>
              <Switch value={form.isStupidCost} onValueChange={(v) => setForm({...form, isStupidCost: v})} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>필수 고정 지출</Text>
              <Switch value={form.isFixedExpense} onValueChange={(v) => setForm({...form, isFixedExpense: v})} />
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="메모 입력" 
              placeholderTextColor="#a0aec0"
              value={form.memo} 
              onChangeText={(t) => setForm({...form, memo: t})} 
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.buttonText}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleUpdate}>
                <Text style={styles.buttonText}>적용하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 내역 등록</Text>
            <View style={styles.typeRow}>
               <TouchableOpacity 
                style={[styles.typeBtn, form.type === 'EXPENSE' ? styles.typeBtnActive : { opacity: 0.6 }]} 
                onPress={() => setForm({...form, type: 'EXPENSE'})}
               >
                 <Text style={styles.buttonText}>지출</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                style={[styles.typeBtn, form.type === 'INCOME' ? [styles.typeBtnActive, { backgroundColor: '#48bb78' }] : { opacity: 0.6, backgroundColor: '#48bb78' }]} 
                onPress={() => setForm({...form, type: 'INCOME'})}
               >
                 <Text style={styles.buttonText}>수입</Text>
               </TouchableOpacity>
            </View>
            <TextInput 
              style={styles.input} 
              placeholder="금액" 
              placeholderTextColor="#a0aec0"
              keyboardType="numeric"
              value={form.amount} 
              onChangeText={(t) => setForm({...form, amount: t})} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="내용 (예: GS25)" 
              placeholderTextColor="#a0aec0"
              value={form.vendor} 
              onChangeText={(t) => setForm({...form, vendor: t})} 
            />
            <View style={styles.switchRow}>
              <Text style={styles.label}>필수 고정 내역</Text>
              <Switch value={form.isFixedExpense} onValueChange={(v) => setForm({...form, isFixedExpense: v})} />
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleAdd}>
                <Text style={styles.buttonText}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a202c' },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#2d3748' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  vendor: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  ignoreText: { color: '#718096', fontSize: 11 },
  amount: { fontSize: 16, fontWeight: 'bold' },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: '#a0aec0', fontSize: 12 },
  badgeContainer: { flexDirection: 'row' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 30 },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 20 },
  modalContent: { backgroundColor: '#2d3748', borderRadius: 20, padding: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#1a202c', color: '#fff', borderRadius: 10, padding: 12, marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { color: '#fff', fontSize: 15 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
  cancelBtn: { backgroundColor: '#4a5568' },
  saveBtn: { backgroundColor: '#3182ce' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  typeRow: { flexDirection: 'row', marginBottom: 15 },
  typeBtn: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#e53e3e', borderRadius: 10, marginHorizontal: 5 },
  typeBtnActive: { borderWidth: 2, borderColor: '#fff' },
});

export default ConsumptionDetail;
