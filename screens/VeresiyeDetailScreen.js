import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { addDebt, getCustomerDebts, deleteDebt, addTransaction } from '../services/database';

export default function VeresiyeDetailScreen({ route, navigation }) {
    const { customerId, customerName } = route.params;
    const [debts, setDebts] = useState([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [transactionType, setTransactionType] = useState('debt'); // 'debt' or 'payment'

    useEffect(() => {
        loadDebts();
        navigation.setOptions({ title: `${customerName} - Detaylar` });
    }, []);

    const loadDebts = async () => {
        const data = await getCustomerDebts(customerId);
        setDebts(data);
    };

    const handleAddTransaction = async () => {
        if (!amount) {
            Alert.alert('Uyarı', 'Lütfen tutar giriniz.');
            return;
        }
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            Alert.alert('Hata', 'Geçerli bir tutar giriniz.');
            return;
        }

        try {
            // Eğer ödeme ise tutarı eksiye çevir
            const finalAmount = transactionType === 'payment' ? -numAmount : numAmount;
            const finalDesc = description || (transactionType === 'payment' ? 'Ödeme / Tahsilat' : 'Borç');

            await addDebt(customerId, finalAmount, finalDesc);

            // KASA ENTEGRASYONU (Otomatik Gelir/Gider Ekleme)
            if (transactionType === 'payment') {
                // Ödeme Alındı -> Kasa Geliri (+)
                const financeDesc = `Veresiye Tahsilat: ${customerName} - ${description}`;
                await addTransaction('income', numAmount, financeDesc);
            } else {
                // Borç Verildi -> Kasa Gideri (-)
                const financeDesc = `Veresiye Verildi: ${customerName} - ${description}`;
                await addTransaction('expense', numAmount, financeDesc);
            }

            setAmount('');
            setDescription('');
            loadDebts();

            if (transactionType === 'payment') {
                Alert.alert('Başarılı', 'Ödeme alındı ve Kasaya "Gelir" olarak işlendi.');
            } else {
                Alert.alert('Başarılı', 'Borç eklendi ve Kasaya "Gider" olarak işlendi.');
            }
        } catch (error) {
            Alert.alert('Hata', 'İşlem sırasında sorun oluştu.');
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Sil', 'Bu işlemi silmek istediğine emin misin?', [
            { text: 'Vazgeç', style: 'cancel' },
            {
                text: 'Sil',
                style: 'destructive',
                onPress: async () => {
                    await deleteDebt(id);
                    loadDebts();
                }
            }
        ]);
    };

    const calculateTotal = () => {
        return debts.reduce((sum, item) => sum + item.amount, 0);
    };

    const renderItem = ({ item }) => {
        const isPayment = item.amount < 0;
        return (
            <View style={[styles.card, isPayment && styles.paymentCard]}>
                <View style={styles.cardLeft}>
                    <Text style={styles.desc}>{item.description || (isPayment ? 'Ödeme' : 'Borç')}</Text>
                    <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.cardRight}>
                    <Text style={[styles.amount, isPayment ? styles.paymentText : styles.debtText]}>
                        {isPayment ? '+' : ''} {Math.abs(item.amount).toFixed(2)} TL
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.summaryContainer}>
                <LinearGradient colors={['#6c5ce7', '#a29bfe']} style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>{customerName.toUpperCase()} KALAN BORÇ</Text>
                    <Text style={styles.summaryValue}>{calculateTotal().toFixed(2)} TL</Text>
                </LinearGradient>
            </View>

            {/* İşlem Formu */}
            <View style={styles.form}>
                {/* İşlem Tipi Seçimi */}
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeBtn, transactionType === 'debt' && styles.activeDebtBtn]}
                        onPress={() => setTransactionType('debt')}
                    >
                        <Text style={[styles.typeBtnText, transactionType === 'debt' && styles.activeBtnText]}>Borç Ekle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, transactionType === 'payment' && styles.activePaymentBtn]}
                        onPress={() => setTransactionType('payment')}
                    >
                        <Text style={[styles.typeBtnText, transactionType === 'payment' && styles.activeBtnText]}>Ödeme Al (Düş)</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Tutar (TL)"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <TextInput
                        style={[styles.input, { flex: 2, marginLeft: 10 }]}
                        placeholder="Açıklama"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={handleAddTransaction}
                >
                    <LinearGradient
                        colors={transactionType === 'debt' ? ['#e17055', '#d63031'] : ['#00b894', '#00cec9']}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.btnText}>
                            {transactionType === 'debt' ? 'Borç Kaydet' : 'Ödeme Kaydet'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <FlatList
                data={debts}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f5f7fa' },
    summaryContainer: { padding: 20 },
    summaryCard: { padding: 20, borderRadius: 15, alignItems: 'center', elevation: 5 },
    summaryLabel: { color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' },
    summaryValue: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 5 },
    form: { backgroundColor: '#fff', margin: 20, marginTop: 0, padding: 15, borderRadius: 12, elevation: 3 },
    row: { flexDirection: 'row', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, backgroundColor: '#f9f9f9' },
    addBtn: { borderRadius: 8, overflow: 'hidden' },
    btnGradient: { padding: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' },
    list: { padding: 20 },
    card: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
    paymentCard: { borderLeftWidth: 4, borderLeftColor: '#00b894' },
    desc: { fontSize: 16, fontWeight: '600', color: '#2d3436' },
    date: { fontSize: 12, color: '#b2bec3', marginTop: 2 },
    cardRight: { flexDirection: 'row', alignItems: 'center' },
    amount: { fontSize: 16, fontWeight: 'bold', marginRight: 15 },
    debtText: { color: '#d63031' },
    paymentText: { color: '#00b894' },
    deleteIcon: { fontSize: 18 },

    // Type Selector Styles
    typeSelector: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#f5f6fa', borderRadius: 8, padding: 3 },
    typeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    activeDebtBtn: { backgroundColor: '#fff', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 1 },
    activePaymentBtn: { backgroundColor: '#fff', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 1 },
    typeBtnText: { fontWeight: '600', color: '#b2bec3' },
    activeBtnText: { color: '#2d3436' },
});
