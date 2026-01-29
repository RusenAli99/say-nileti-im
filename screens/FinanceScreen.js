import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { addTransaction, getTransactions, deleteTransaction, updateTransaction } from '../services/database';

export default function FinanceScreen({ navigation }) {
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('income'); // 'income' or 'expense'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        const data = await getTransactions();
        setTransactions(data);
    };

    const handleAdd = async () => {
        if (!amount || !description) {
            Alert.alert('Hata', 'Lütfen tutar ve açıklama giriniz.');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            Alert.alert('Hata', 'Geçerli bir tutar giriniz.');
            return;
        }

        if (isNaN(numAmount)) {
            Alert.alert('Hata', 'Geçerli bir tutar giriniz.');
            return;
        }

        if (editMode && editId) {
            await updateTransaction(editId, type, numAmount, description);
            setEditMode(false);
            setEditId(null);
            Alert.alert('Başarılı', 'Kayıt güncellendi.');
        } else {
            await addTransaction(type, numAmount, description);
        }

        setAmount('');
        setDescription('');
        loadTransactions();
    };

    const handleEdit = (item) => {
        setAmount(item.amount.toString());
        setDescription(item.description);
        setType(item.type);
        setEditMode(true);
        setEditId(item.id);
    };

    const handleCancelEdit = () => {
        setAmount('');
        setDescription('');
        setType('income');
        setEditMode(false);
        setEditId(null);
    };

    const handleDelete = (id) => {
        Alert.alert('Sil', 'Kaydı silmek istiyor musunuz?', [
            { text: 'Vazgeç', style: 'cancel' },
            {
                text: 'Sil', style: 'destructive', onPress: async () => {
                    await deleteTransaction(id);
                    loadTransactions();
                }
            }
        ]);
    };

    const getFilteredTransactions = () => {
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            if (viewMode === 'daily') {
                return tDate.getDate() === currentDate.getDate() &&
                    tDate.getMonth() === currentDate.getMonth() &&
                    tDate.getFullYear() === currentDate.getFullYear();
            } else {
                return tDate.getMonth() === currentDate.getMonth() &&
                    tDate.getFullYear() === currentDate.getFullYear();
            }
        });
    };

    const calculateBalance = () => {
        let income = 0;
        let expense = 0;
        const filtered = getFilteredTransactions();
        filtered.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        });
        return { income, expense, balance: income - expense };
    };

    const { income, expense, balance } = calculateBalance();
    const filteredTransactions = getFilteredTransactions();

    const changeDate = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const formatDateDisplay = () => {
        if (viewMode === 'daily') {
            return currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        } else {
            return currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity
                style={styles.cardLeft}
                onPress={() => handleEdit(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconBox, item.type === 'income' ? styles.incomeIcon : styles.expenseIcon]}>
                    <Text style={styles.icon}>{item.type === 'income' ? '💰' : '💸'}</Text>
                </View>
                <View>
                    <Text style={styles.cardTitle}>{item.description}</Text>
                    <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString().slice(0, 5)}</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.cardRight}>
                <Text style={[styles.amount, item.type === 'income' ? styles.incomeText : styles.expenseText]}>
                    {item.type === 'income' ? '+' : '-'}{item.amount.toFixed(2)} TL
                </Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Text>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gelir & Gider (Kasa)</Text>
            </View>

            {/* Tarih ve Mod Seçimi */}
            <View style={styles.dateNav}>
                <View style={styles.viewModeContainer}>
                    <TouchableOpacity
                        style={[styles.viewModeBtn, viewMode === 'daily' && styles.activeViewMode]}
                        onPress={() => setViewMode('daily')}
                    >
                        <Text style={[styles.viewModeText, viewMode === 'daily' && styles.activeViewModeText]}>Günlük</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewModeBtn, viewMode === 'monthly' && styles.activeViewMode]}
                        onPress={() => setViewMode('monthly')}
                    >
                        <Text style={[styles.viewModeText, viewMode === 'monthly' && styles.activeViewModeText]}>Aylık</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dateControls}>
                    <TouchableOpacity onPress={() => changeDate(viewMode === 'daily' ? -1 : -30)} style={styles.arrowBtn}>
                        <Text style={styles.arrowText}>◀</Text>
                    </TouchableOpacity>
                    <Text style={styles.dateText}>{formatDateDisplay()}</Text>
                    <TouchableOpacity onPress={() => changeDate(viewMode === 'daily' ? 1 : 30)} style={styles.arrowBtn}>
                        <Text style={styles.arrowText}>▶</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Özet Kartları */}
            <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, { backgroundColor: '#e3fce1' }]}>
                    <Text style={styles.summaryLabel}>Gelir</Text>
                    <Text style={[styles.summaryValue, { color: '#27ae60' }]}>+{income.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#ffecec' }]}>
                    <Text style={styles.summaryLabel}>Gider</Text>
                    <Text style={[styles.summaryValue, { color: '#d63031' }]}>-{expense.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#dfe6e9' }]}>
                    <Text style={styles.summaryLabel}>Bakiye</Text>
                    <Text style={[styles.summaryValue, { color: balance >= 0 ? '#27ae60' : '#d63031' }]}>
                        {balance.toFixed(2)}
                    </Text>
                </View>
            </View>

            <View style={styles.inputSection}>
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'income' && styles.activeTypeIncome]}
                        onPress={() => setType('income')}
                    >
                        <Text style={[styles.typeText, type === 'income' && styles.activeTypeText]}>Gelir Ekle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'expense' && styles.activeTypeExpense]}
                        onPress={() => setType('expense')}
                    >
                        <Text style={[styles.typeText, type === 'expense' && styles.activeTypeText]}>Gider Ekle</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                    <TextInput
                        style={[styles.input, { flex: 2, marginRight: 10 }]}
                        placeholder="Açıklama"
                        value={description}
                        onChangeText={setDescription}
                    />
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Tutar"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                <TouchableOpacity style={[
                    styles.addBtn,
                    type === 'income' ? { backgroundColor: '#00b894' } : { backgroundColor: '#d63031' },
                    editMode ? { backgroundColor: '#0984e3' } : {}
                ]} onPress={handleAdd}>
                    <Text style={styles.addBtnText}>
                        {editMode ? 'Güncelle' : (type === 'income' ? 'Kaydet (+)' : 'Kaydet (-)')}
                    </Text>
                </TouchableOpacity>

                {editMode && (
                    <TouchableOpacity style={[styles.addBtn, styles.cancelBtn]} onPress={handleCancelEdit}>
                        <Text style={styles.addBtnText}>İptal</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.listContainer}>
                <Text style={styles.listTitle}>Hareketler ({filteredTransactions.length})</Text>
                <FlatList
                    data={filteredTransactions}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    dateNav: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
    },
    viewModeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        backgroundColor: '#f1f2f6',
        borderRadius: 8,
        padding: 2,
        alignSelf: 'center',
    },
    viewModeBtn: {
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    activeViewMode: {
        backgroundColor: '#0984e3',
    },
    viewModeText: {
        color: '#636e72',
        fontWeight: '600',
    },
    activeViewModeText: {
        color: '#fff',
    },
    dateControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowBtn: {
        padding: 10,
    },
    arrowText: {
        fontSize: 20,
        color: '#2d3436',
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginHorizontal: 15,
        minWidth: 150,
        textAlign: 'center',
    },
    summaryContainer: {
        flexDirection: 'row',
        padding: 15,
        justifyContent: 'space-between',
    },
    summaryCard: {
        flex: 1,
        padding: 10,
        borderRadius: 10,
        marginHorizontal: 4,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#636e72',
        marginBottom: 5,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputSection: {
        margin: 15,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: '#f1f2f6',
        borderRadius: 8,
        padding: 2,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTypeIncome: {
        backgroundColor: '#00b894',
    },
    activeTypeExpense: {
        backgroundColor: '#d63031',
    },
    typeText: {
        fontWeight: '600',
        color: '#636e72',
    },
    activeTypeText: {
        color: '#fff',
    },
    formRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#f5f7fa',
        borderWidth: 1,
        borderColor: '#dcdde1',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    addBtn: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#b2bec3',
        marginTop: 10,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 15,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 10,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    incomeIcon: {
        backgroundColor: '#e3fce1',
    },
    expenseIcon: {
        backgroundColor: '#ffecec',
    },
    icon: {
        fontSize: 20,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3436',
    },
    cardDate: {
        fontSize: 11,
        color: '#b2bec3',
        marginTop: 2,
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    incomeText: {
        color: '#00b894',
    },
    expenseText: {
        color: '#d63031',
    },
    deleteBtn: {
        padding: 4,
    },
});
