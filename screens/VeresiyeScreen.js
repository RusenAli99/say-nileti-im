import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { addCustomer, getCustomers, deleteCustomer } from '../services/database';
import { useIsFocused } from '@react-navigation/native';

export default function VeresiyeScreen({ navigation }) {
    const isFocused = useIsFocused();
    const [customers, setCustomers] = useState([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (isFocused) {
            loadCustomers();
        }
    }, [isFocused]);

    const loadCustomers = async () => {
        const data = await getCustomers();
        setCustomers(data);
    };

    const handleAddCustomer = async () => {
        if (!name) {
            Alert.alert('Uyarı', 'Lütfen isim giriniz.');
            return;
        }

        try {
            await addCustomer(name, phone);
            setName('');
            setPhone('');
            loadCustomers();
            Alert.alert('Başarılı', 'Müşteri eklendi.');
        } catch (error) {
            Alert.alert('Hata', 'Müşteri eklenirken bir sorun oluştu.');
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Sil', 'Bu müşteriyi ve tüm borç kayıtlarını silmek istiyor musunuz?', [
            { text: 'Vazgeç', style: 'cancel' },
            {
                text: 'Sil', style: 'destructive', onPress: async () => {
                    try {
                        await deleteCustomer(id);
                        loadCustomers();
                    } catch (error) {
                        Alert.alert('Hata', 'Silme işlemi başarısız.');
                    }
                }
            }
        ]);
    };

    const calculateTotalReceivable = () => {
        return customers.reduce((sum, c) => sum + (c.totalDebt || 0), 0);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('VeresiyeDetail', {
                customerId: item.id,
                customerName: item.name
            })}
        >
            <View style={styles.cardLeft}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardDesc}>{item.phone || 'Telefon yok'}</Text>
                </View>
            </View>

            <View style={styles.cardRight}>
                <Text style={styles.amount}>{(item.totalDebt || 0).toFixed(2)} TL</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Text style={{ fontSize: 18 }}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Veresiye Defteri</Text>
            </View>

            {/* Genel Toplam */}
            <View style={styles.summaryContainer}>
                <LinearGradient colors={['#e17055', '#fab1a0']} style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>TOPLAM ALACAK</Text>
                    <Text style={styles.summaryValue}>{calculateTotalReceivable().toFixed(2)} TL</Text>
                </LinearGradient>
            </View>

            {/* Müşteri Ekleme Formu */}
            <View style={styles.inputSection}>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 2 }]}
                        placeholder="Müşteri Adı Soyadı"
                        value={name}
                        onChangeText={setName}
                    />
                </View>
                <View style={[styles.row, { marginTop: 10 }]}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 10 }]}
                        placeholder="Telefon (Opsiyonel)"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={handleAddCustomer}>
                        <LinearGradient
                            colors={['#2d3436', '#636e72']}
                            style={styles.addBtnGradient}
                        >
                            <Text style={styles.addBtnText}>+ Kişi Ekle</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Müşteri Listesi */}
            <FlatList
                data={customers}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={<Text style={styles.listTitle}>Müşteri Listesi ({customers.length})</Text>}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
            />
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
    summaryContainer: {
        padding: 20,
    },
    summaryCard: {
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    summaryValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    inputSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
    },
    input: {
        backgroundColor: '#f5f7fa',
        borderWidth: 1,
        borderColor: '#dcdde1',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    addBtn: {
        marginTop: 15,
        borderRadius: 10,
        overflow: 'hidden',
    },
    addBtnGradient: {
        padding: 15,
        alignItems: 'center',
    },
    addBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelLink: {
        marginTop: 10,
        alignItems: 'center',
    },
    cancelText: {
        color: '#d63031',
        fontWeight: '600',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#636e72',
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffeaa7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#d35400',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    cardDesc: {
        fontSize: 12,
        color: '#636e72',
    },
    cardDate: {
        fontSize: 10,
        color: '#b2bec3',
        marginTop: 2,
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d63031',
        marginBottom: 5,
    },
    deleteBtn: {
        padding: 5,
    }
});
