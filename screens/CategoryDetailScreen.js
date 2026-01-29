import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { getProducts, initDatabase, updateStock, deleteProduct } from '../services/database';

// Ortak Marka Listesi
const BRANDS = [
    { id: 'b1', title: 'Apple', icon: '🍎', image: require('../assets/brands/apple.png') },
    { id: 'b2', title: 'Samsung', icon: '📱', image: require('../assets/brands/samsung.png') },
    { id: 'b3', title: 'Xiaomi', icon: '📱', image: require('../assets/brands/xiaomi.png') },
    { id: 'b4', title: 'Oppo', icon: '📱', image: require('../assets/brands/oppo.png') },
    { id: 'b5', title: 'Vivo', icon: '📱', image: require('../assets/brands/vivo.png') },
    { id: 'b6', title: 'Realme', icon: '📱', image: require('../assets/brands/realme.png') },
    { id: 'b7', title: 'Huawei', icon: '📱', image: require('../assets/brands/huawei.png') },
    { id: 'b8', title: 'Diğer', icon: '🌐' },
];

// Kategori Hiyerarşisi
const SUB_CATEGORIES = {
    // 1. Seviye: Ana Kategoriler -> Alt Kategoriler
    'Telefonlar': [
        { id: 't1', title: 'Sıfır Telefonlar', icon: '🆕' },
        { id: 't2', title: 'İkinci El Telefonlar', icon: '🔄' },
        { id: 't3', title: 'Yenilenmiş (Refurbished)', icon: '🛠️' },
        { id: 't4', title: 'Tuşlu Telefonlar', icon: '🔢' },
    ],
    // 2. Seviye: Alt Kategoriler -> Markalar
    'Sıfır Telefonlar': BRANDS,
    'İkinci El Telefonlar': BRANDS,
    'Yenilenmiş (Refurbished)': BRANDS,

    // Şarj & Batarya Alt Kategorileri
    'Şarj & Batarya': [
        { id: 'c1', title: 'Şarj Adaptörleri', icon: '🔌' },
        { id: 'c2', title: 'Şarj Kabloları', icon: '➰' },
        { id: 'c3', title: 'Powerbank', icon: '🔋' },
        { id: 'c4', title: 'Kablosuz Şarj Cihazları', icon: '⚡' },
        { id: 'c5', title: 'Araç Şarj Cihazları', icon: '🚗' },
    ],

    // 3. Seviye: Şarj Adaptörleri Alt Kategorileri
    'Şarj Adaptörleri': [
        { id: 'ca1', title: 'Hızlı şarj (20W / 25W / 33W / 65W)', icon: '⚡' },
        { id: 'ca2', title: 'Type-C adaptör', icon: '🔌' },
        { id: 'ca3', title: 'iPhone uyumlu adaptör', icon: '🍏' },
        { id: 'ca4', title: 'Orijinal / Muadil', icon: '⚖️' },
    ],

    // 3. Seviye: Şarj Kabloları Alt Kategorileri
    'Şarj Kabloları': [
        { id: 'cc1', title: 'Type-C → Type-C', icon: '🔌' },
        { id: 'cc2', title: 'USB → Type-C', icon: '🔌' },
        { id: 'cc3', title: 'Lightning (iPhone)', icon: '⚡' },
        { id: 'cc4', title: 'Micro USB', icon: '🔌' },
        { id: 'cc5', title: 'Örgülü / Normal', icon: '🧶' },
    ],

    // Kulaklık & Ses Alt Kategorileri
    'Kulaklık & Ses': [
        { id: 'k1', title: 'Kablolu Kulaklık', icon: '🎧' },
        { id: 'k2', title: 'Bluetooth Kulaklık (TWS)', icon: '🎵' },
        { id: 'k3', title: 'Kulak Üstü (Headset)', icon: '🎧' },
        { id: 'k4', title: 'Bluetooth Hoparlör', icon: '🔊' },
        { id: 'k5', title: 'Mikrofon', icon: '🎤' },
    ],

    // Kılıf & Ekran Koruma Alt Kategorileri
    'Kılıf & Ekran Koruma': [
        { id: 'case1', title: 'Kılıf', icon: '📱' },
        { id: 'screen1', title: 'Ekran Koruma', icon: '🛡️' },
    ],

    // Alt kategorilerin detayları (Markalar ile eşleştirme)
    'Kılıf': BRANDS,
    'Ekran Koruma': BRANDS,
    'Teknik Servis': BRANDS, // Markalar direkt açılacak
    'Araç İçi': [
        { id: 'ai1', title: 'Araç İçi Telefon Tutucular', icon: '🚗' },
        { id: 'ai2', title: 'Araç Şarj Cihazları', icon: '🔌' },
        { id: 'ai3', title: 'FM Transmitter', icon: '📻' },
        { id: 'ai4', title: 'Araç İçi Bluetooth Kit', icon: '🎵' },
        { id: 'ai5', title: 'Araç Kamerası (Dash Cam)', icon: '📹' },
        { id: 'ai6', title: 'Araç İçi LED & Ambiyans', icon: '💡' }
    ],
    // Araç İçi Alt Kategorileri - Hepsi Markalara Gitsin (veya direkt ürün listesine)
    'Araç İçi Telefon Tutucular': null,
    'Araç Şarj Cihazları': null,
    'FM Transmitter': null,
    'Araç İçi Bluetooth Kit': null,
    'Araç Kamerası (Dash Cam)': null,
    'Araç İçi LED & Ambiyans': null,

    // Hafıza & Depolama Alt Kategorileri
    'Hafıza & Depolama': [
        { id: 'h1', title: 'USB Flash Bellek', icon: '💾' },
        { id: 'h2', title: 'Hafıza Kartı', icon: '🗃️' },
        { id: 'h3', title: 'Kart Okuyucu', icon: '🔌' },
        { id: 'h4', title: 'Harici Disk', icon: '💽' },
    ],
    'USB Flash Bellek': null,
    'Hafıza Kartı': null,
    'Kart Okuyucu': null,
    'Harici Disk': null,
};

export default function CategoryDetailScreen({ route, navigation }) {
    const { title, parentCategory } = route.params;
    const isFocused = useIsFocused();

    // Bu başlığa ait alt kategori veya marka listesi var mı kontrol et
    const listData = SUB_CATEGORIES[title];

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Eğer alt kategori listesi yoksa (yani en alt seviyedeyiz, örn: Apple), o zaman ürünleri çek
        if (!listData && isFocused) {
            fetchProducts();
        }
    }, [isFocused, title, parentCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        // parentCategory (örn: Sıfır Telefonlar) ve brand (örn: Apple) kullanarak çekiyoruz
        const res = await getProducts(parentCategory, title);
        setProducts(res);
        setLoading(false);
    };

    // Silme İşlemi
    const handleDelete = (product) => {
        Alert.alert(
            "Ürünü Sil",
            `${product.model} adlı ürünü silmek istediğinize emin misiniz?`,
            [
                { text: "Vazgeç", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteProduct(product.id);
                            // Listeden yerel olarak kaldır
                            setProducts(prev => prev.filter(p => p.id !== product.id));
                        } catch (error) {
                            Alert.alert("Hata", "Silme işlemi tamamlanamadı.");
                        }
                    }
                }
            ]
        );
    };

    // Hızlı Stok Güncelleme
    const handleStockUpdate = async (product, change) => {
        const newQuantity = Math.max(0, product.quantity + change);
        if (newQuantity === product.quantity) return;

        try {
            await updateStock(product.id, newQuantity);
            // Listeyi yerel state'de güncelle (tekrar fetch yapmadan hızlı UI)
            setProducts(prev => prev.map(p =>
                p.id === product.id ? { ...p, quantity: newQuantity } : p
            ));
        } catch (error) {
            console.error("Stok güncellenemedi", error);
        }
    };

    const handleEditProduct = (product) => {
        // Düzenleme sayfasına git, product verisini ve context'i gönder
        navigation.navigate('AddProduct', {
            category: parentCategory || product.category, // fallback
            brand: product.brand,
            product: product // Edit mode trigger
        });
    };

    const handleItemPress = (itemTitle) => {
        // Eğer tıklanan öğenin de alt kategorileri varsa (örn: Sıfır Telefonlar -> Apple), oraya git
        // Yoksa (örn: Apple -> ...), ürün listesi sayfasına (kendisine) git ama artık data yok, placeholder gösterecek
        // Navigation params'a parent başlığı da ekleyelim (cascade)
        navigation.push('CategoryDetail', { title: itemTitle, parentCategory: title });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handleItemPress(item.title)}
        >
            <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.cardGradient}
            >
                {item.image ? (
                    <Image source={item.image} style={styles.brandLogo} resizeMode="contain" />
                ) : (
                    <Text style={styles.cardIcon}>{item.icon}</Text>
                )}
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.arrow}>›</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderProduct = ({ item }) => (
        <TouchableOpacity
            style={styles.productCard}
            activeOpacity={0.9}
            onPress={() => handleEditProduct(item)}
        >
            <LinearGradient
                colors={['#ffffff', '#fcfcfc']}
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1, borderRadius: 12, padding: 12 }}
            >
                <View style={styles.productLeft}>
                    {item.imageUri ? (
                        <Image source={{ uri: item.imageUri }} style={styles.productImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={{ fontSize: 20 }}>📷</Text>
                        </View>
                    )}
                </View>
                <View style={styles.productInfo}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={styles.productModel}>{item.model}</Text>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDelete(item); }} style={{ padding: 5 }}>
                            <Text style={{ fontSize: 18 }}>🗑️</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Aksesuar veya Telefon ayrımı olmadan sade gösterim veya detay */}
                    {item.storage && <Text style={styles.productDetailBadge}>{item.storage} | {item.ram}</Text>}

                    <Text style={styles.productPrice}>{item.price} TL</Text>

                    {/* Stok Kontrol Butonları */}
                    <View style={styles.stockControl}>
                        <TouchableOpacity
                            style={styles.stockBtn}
                            onPress={(e) => { e.stopPropagation(); handleStockUpdate(item, -1); }}
                        >
                            <Text style={styles.stockBtnText}>-</Text>
                        </TouchableOpacity>

                        <Text style={styles.stockText}>Stok: {item.quantity}</Text>

                        <TouchableOpacity
                            style={styles.stockBtn}
                            onPress={(e) => { e.stopPropagation(); handleStockUpdate(item, 1); }}
                        >
                            <Text style={styles.stockBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>
                    {listData ? 'Seçim Yapınız' : 'Ürün Listesi'}
                </Text>
            </View>

            <View style={styles.content}>
                {listData ? (
                    <FlatList
                        data={listData}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    // ÜRÜN LİSTESİ (DB'den gelenler)
                    <View style={{ flex: 1 }}>
                        {/* Eğer ürün yoksa boş durum */}
                        {products.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconContainer}>
                                    {/* Marka logosu varsa onu göster, yoksa ikon */}
                                    {title === 'Apple' ? (
                                        <Image source={require('../assets/brands/apple.png')} style={styles.bigBrandLogo} resizeMode="contain" />
                                    ) : title === 'Samsung' ? (
                                        <Image source={require('../assets/brands/samsung.png')} style={styles.bigBrandLogo} resizeMode="contain" />
                                    ) : title === 'Xiaomi' ? (
                                        <Image source={require('../assets/brands/xiaomi.png')} style={styles.bigBrandLogo} resizeMode="contain" />
                                    ) : title === 'Oppo' ? (
                                        <Image source={require('../assets/brands/oppo.png')} style={styles.bigBrandLogo} resizeMode="contain" />
                                    ) : title === 'Vivo' ? (
                                        <Image source={require('../assets/brands/vivo.png')} style={styles.bigBrandLogo} resizeMode="contain" />
                                    ) : title === 'Realme' ? (
                                        <Image source={require('../assets/brands/realme.png')} style={styles.bigBrandLogo} resizeMode="contain" />
                                    ) : title === 'Huawei' ? (
                                        <Image source={require('../assets/brands/huawei.png')} style={styles.bigBrandLogo} resizeMode="contain" />
                                    ) : (
                                        <Text style={styles.placeholderIcon}>📱</Text>
                                    )}
                                </View>
                                <Text style={styles.placeholderText}>
                                    {title} stokları şu an boş.
                                </Text>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => navigation.navigate('AddProduct', { category: parentCategory, brand: title })}
                                >
                                    <LinearGradient
                                        colors={['#27ae60', '#2ecc71']}
                                        style={styles.addButtonGradient}
                                    >
                                        <Text style={styles.addButtonText}>+ Yeni {title} Ekle</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // Ürünler Varsa Listele
                            <View style={{ flex: 1 }}>
                                <FlatList
                                    data={products}
                                    keyExtractor={(item) => item.id.toString()}
                                    contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                                    renderItem={renderProduct}
                                    initialNumToRender={10}
                                    maxToRenderPerBatch={10}
                                    windowSize={5}
                                    removeClippedSubviews={true}
                                />
                                {/* Liste doluyken de ekleme butonu altta çıksın (floating) */}
                                <TouchableOpacity
                                    style={styles.floatingAddButton}
                                    onPress={() => navigation.navigate('AddProduct', { category: parentCategory, brand: title })}
                                >
                                    <LinearGradient
                                        colors={['#27ae60', '#2ecc71']}
                                        style={styles.fabGradient}
                                    >
                                        <Text style={styles.fabText}>+</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    subtitle: {
        fontSize: 14,
        color: '#636e72',
        marginTop: 4,
    },
    content: {
        flex: 1,
    },
    listContainer: {
        padding: 15,
    },
    card: {
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
        height: 70,
    },
    cardGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    cardIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3436',
        flex: 1,
    },
    arrow: {
        fontSize: 24,
        color: '#b2bec3',
        fontWeight: '300',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    placeholderIcon: {
        fontSize: 60,
        marginBottom: 20,
        opacity: 0.5,
    },
    placeholderText: {
        fontSize: 18,
        color: '#636e72',
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: '500',
    },
    todoText: {
        fontSize: 14,
        color: '#b2bec3',
        textAlign: 'center',
    },
    addButton: {
        marginTop: 20,
        borderRadius: 25,
        elevation: 5,
        shadowColor: "#27ae60",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    addButtonGradient: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        flexDirection: 'row',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    brandLogo: {
        width: 40,
        height: 40,
        marginRight: 15,
    },
    bigBrandLogo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    emptyIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Product Card Styles
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    productLeft: {
        marginRight: 15,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f1f2f6',
    },
    placeholderImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f1f2f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        flex: 1,
    },
    productModel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 4,
    },
    productDetailsRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    productDetailBadge: {
        fontSize: 12,
        color: '#636e72',
        backgroundColor: '#dfe6e9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 6,
        overflow: 'hidden',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#27ae60',
    },
    productRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    stockBadge: {
        backgroundColor: '#e3fce1',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stockText: {
        fontSize: 12,
        color: '#27ae60',
        fontWeight: 'bold',
    },
    stockControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: '#f1f2f6',
        borderRadius: 8,
        padding: 4,
        alignSelf: 'flex-start',
    },
    stockBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#dfe6e9',
        marginHorizontal: 5,
    },
    stockBtnText: {
        color: '#2d3436',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: -2,
    },
    floatingAddButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        borderRadius: 30,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabText: {
        fontSize: 30,
        color: '#fff',
        marginTop: -3,
        fontWeight: '300',
    }
});
