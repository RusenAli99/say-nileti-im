import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { addNote, getNotes, deleteNote, updateNote } from '../services/database';

const { width } = Dimensions.get('window');

const Calculator = () => {
    const [display, setDisplay] = useState('0');
    const [operation, setOperation] = useState(null);
    const [prevValue, setPrevValue] = useState(null);
    const [newNumber, setNewNumber] = useState(true);

    const handleNumber = (num) => {
        if (newNumber) {
            setDisplay(num.toString());
            setNewNumber(false);
        } else {
            setDisplay(display === '0' ? num.toString() : display + num);
        }
    };

    const handleOperation = (op) => {
        setOperation(op);
        setPrevValue(parseFloat(display));
        setNewNumber(true);
    };

    const calculate = () => {
        if (!operation || prevValue === null) return;
        const current = parseFloat(display);

        // Basit hesaplama. Daha güvenli olması için eval yerine switch-case
        let result = 0;
        switch (operation) {
            case '+': result = prevValue + current; break;
            case '-': result = prevValue - current; break;
            case '*': result = prevValue * current; break;
            case '/': result = prevValue / current; break;
        }

        setDisplay(result.toString());
        setOperation(null);
        setPrevValue(null);
        setNewNumber(true);
    };

    const clear = () => {
        setDisplay('0');
        setOperation(null);
        setPrevValue(null);
        setNewNumber(true);
    };

    const buttons = [
        ['C', '', '', '/'],
        ['7', '8', '9', '*'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '=', '']
    ];

    return (
        <View style={styles.calcContainer}>
            <View style={styles.calcDisplay}>
                <Text style={styles.calcDisplayText}>{display}</Text>
            </View>
            <View style={styles.calcButtons}>
                {buttons.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.calcRow}>
                        {row.map((btn, colIndex) => (
                            <TouchableOpacity
                                key={colIndex}
                                style={[
                                    styles.calcBtn,
                                    btn === '=' ? styles.calcBtnEqual : null,
                                    ['/', '*', '-', '+'].includes(btn) ? styles.calcBtnOp : null,
                                    btn === 'C' ? styles.calcBtnClear : null,
                                    btn === '' ? styles.calcBtnHidden : null
                                ]}
                                onPress={() => {
                                    if (btn === 'C') clear();
                                    else if (btn === '=') calculate();
                                    else if (['/', '*', '-', '+'].includes(btn)) handleOperation(btn);
                                    else if (btn !== '') handleNumber(btn);
                                }}
                                disabled={btn === ''}
                            >
                                <Text style={[
                                    styles.calcBtnText,
                                    ['/', '*', '-', '+', '=', 'C'].includes(btn) ? { color: '#fff' } : null
                                ]}>{btn}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
};

const NotePad = () => {
    const [notes, setNotes] = useState([]);
    const [text, setText] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        const data = await getNotes();
        setNotes(data);
    };

    const handleAdd = async () => {
        if (!text.trim()) return;

        if (editMode && editId) {
            await updateNote(editId, text);
            setEditMode(false);
            setEditId(null);
        } else {
            await addNote(text);
        }

        setText('');
        loadNotes();
    };

    const handleEdit = (item) => {
        setText(item.text);
        setEditMode(true);
        setEditId(item.id);
    };

    const handleCancelEdit = () => {
        setText('');
        setEditMode(false);
        setEditId(null);
    };

    const handleDelete = (id) => {
        Alert.alert('Sil', 'Notu silmek istiyor musunuz?', [
            { text: 'Vazgeç', style: 'cancel' },
            {
                text: 'Sil', style: 'destructive', onPress: async () => {
                    await deleteNote(id);
                    loadNotes();
                }
            }
        ]);
    };

    return (
        <View style={styles.noteContainer}>
            <View style={styles.noteInputContainer}>
                <TextInput
                    style={styles.noteInput}
                    placeholder="Notunuzu yazın..."
                    value={text}
                    onChangeText={setText}
                    multiline
                />
                <View style={styles.actionButtons}>
                    {editMode && (
                        <TouchableOpacity style={[styles.addNoteBtn, styles.cancelBtn]} onPress={handleCancelEdit}>
                            <Text style={{ fontSize: 20, color: '#fff' }}>✕</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.addNoteBtn, editMode ? styles.updateBtn : null]}
                        onPress={handleAdd}
                    >
                        <Text style={{ fontSize: 24, color: '#fff' }}>{editMode ? '✓' : '+'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                data={notes}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.noteItem}
                        onPress={() => handleEdit(item)}
                        activeOpacity={0.7}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.noteText}>{item.text}</Text>
                            <Text style={styles.noteDate}>{new Date(item.date).toLocaleDateString()}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteNoteBtn}>
                            <Text>🗑️</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

export default function NotesScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'calc'

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Asistan</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
                    onPress={() => setActiveTab('notes')}
                >
                    <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>📒 Notlar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'calc' && styles.activeTab]}
                    onPress={() => setActiveTab('calc')}
                >
                    <Text style={[styles.tabText, activeTab === 'calc' && styles.activeTabText]}>🧮 Hesap</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {activeTab === 'notes' ? <NotePad /> : <Calculator />}
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
    },
    tab: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 5,
        backgroundColor: '#f1f2f6',
    },
    activeTab: {
        backgroundColor: '#0984e3',
    },
    tabText: {
        fontSize: 16,
        color: '#636e72',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 10,
    },
    // Calculator Styles
    calcContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 20,
    },
    calcDisplay: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 20,
        alignItems: 'flex-end',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        height: 100, // Fixed height
        justifyContent: 'center',
    },
    calcDisplayText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    calcButtons: {
        gap: 10,
    },
    calcRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    calcBtn: {
        flex: 1,
        height: 70,
        backgroundColor: '#fff',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    calcBtnOp: {
        backgroundColor: '#faa05d',
    },
    calcBtnEqual: {
        backgroundColor: '#27ae60',
        flex: 2, // Bigger
    },
    calcBtnClear: {
        backgroundColor: '#d63031',
    },
    calcBtnHidden: {
        backgroundColor: 'transparent',
        elevation: 0,
    },
    calcBtnText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    // Note Styles
    noteContainer: {
        flex: 1,
    },
    noteInputContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    noteInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: '#dfe6e9',
        fontSize: 16,
    },
    actionButtons: {
        marginLeft: 10,
        gap: 10,
    },
    addNoteBtn: {
        width: 50,
        height: 50,
        backgroundColor: '#0984e3',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateBtn: {
        backgroundColor: '#27ae60',
    },
    cancelBtn: {
        backgroundColor: '#d63031',
        marginBottom: 5,
    },
    noteItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
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
    noteText: {
        fontSize: 16,
        color: '#2d3436',
        flex: 1,
    },
    noteDate: {
        fontSize: 12,
        color: '#b2bec3',
        marginTop: 5,
    },
    deleteNoteBtn: {
        padding: 10,
    }
});
