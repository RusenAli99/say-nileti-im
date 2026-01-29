import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Switch, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { addProduct, updateProduct, initDatabase } from '../services/database';

const STORAGE_OPTIONS = ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];
const RAM_OPTIONS = ['2 GB', '3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB'];

const BRAND_MODELS = {
    'Apple': ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 13 Pro', 'iPhone 14', 'iPhone 14 Pro', 'iPhone 15', 'iPhone 15 Pro', 'iPhone 15 Pro Max'],
    'Samsung': ['Galaxy S24', 'Galaxy S23', 'Galaxy S22', 'Galaxy A54', 'Galaxy A34', 'Galaxy A24', 'Galaxy S21 FE'],
    'Xiaomi': ['Redmi Note 13', 'Redmi Note 12', 'Redmi 12', 'Xiaomi 13T', 'Poco X6', 'Poco F5'],
    'Oppo': ['Reno 11', 'Reno 10', 'A98', 'A78', 'A58'],
    'Vivo': ['V29', 'V29 Lite', 'Y36', 'Y27', 'Y17s'],
    'Realme': ['C55', 'C53', '11 Pro', '11 Pro+', 'GT 2'],
    'Huawei': ['P60 Pro', 'Nova 11', 'Nova 11 Pro', 'Mate 50 Pro', 'Nova Y91'],
};

// Model Özellikleri Veritabanı (Örnek veriler, genişletilebilir)
const MODEL_SPECS = {
    // APPLE
    'iPhone 11': { ram: '4 GB', battery: '3110', screenSize: '6.1 inç', camera: '12MP + 12MP', os: 'iOS 17' },
    'iPhone 12': { ram: '4 GB', battery: '2815', screenSize: '6.1 inç', camera: '12MP + 12MP', os: 'iOS 17' },
    'iPhone 13': { ram: '4 GB', battery: '3240', screenSize: '6.1 inç', camera: '12MP + 12MP', os: 'iOS 17' },
    'iPhone 13 Pro': { ram: '6 GB', battery: '3095', screenSize: '6.1 inç', camera: '12MP + 12MP + 12MP', os: 'iOS 17' },
    'iPhone 14': { ram: '6 GB', battery: '3279', screenSize: '6.1 inç', camera: '12MP + 12MP', os: 'iOS 17' },
    'iPhone 14 Pro': { ram: '6 GB', battery: '3200', screenSize: '6.1 inç', camera: '48MP + 12MP + 12MP', os: 'iOS 17' },
    'iPhone 15': { ram: '6 GB', battery: '3349', screenSize: '6.1 inç', camera: '48MP + 12MP', os: 'iOS 17' },
    'iPhone 15 Pro': { ram: '8 GB', battery: '3274', screenSize: '6.1 inç', camera: '48MP + 12MP + 12MP', os: 'iOS 17' },
    'iPhone 15 Pro Max': { ram: '8 GB', battery: '4422', screenSize: '6.7 inç', camera: '48MP + 12MP + 12MP', os: 'iOS 17' },

    // SAMSUNG
    'Galaxy S24': { ram: '8 GB', battery: '4000', screenSize: '6.2 inç', camera: '50MP + 10MP + 12MP', os: 'Android 14' },
    'Galaxy S23': { ram: '8 GB', battery: '3900', screenSize: '6.1 inç', camera: '50MP + 10MP + 12MP', os: 'Android 13' },
    'Galaxy A54': { ram: '8 GB', battery: '5000', screenSize: '6.4 inç', camera: '50MP + 12MP + 5MP', os: 'Android 13' },
    'Galaxy A34': { ram: '8 GB', battery: '5000', screenSize: '6.6 inç', camera: '48MP + 8MP + 5MP', os: 'Android 13' },

    // XIAOMI
    'Redmi Note 13': { ram: '8 GB', battery: '5000', screenSize: '6.67 inç', camera: '108MP + 6MP', os: 'Android 13' },
    'Redmi Note 12': { ram: '6 GB', battery: '5000', screenSize: '6.67 inç', camera: '50MP + 8MP + 2MP', os: 'Android 13' },
    'Poco X6': { ram: '8 GB', battery: '5100', screenSize: '6.67 inç', camera: '64MP + 8MP + 2MP', os: 'Android 13' },

    // Default fallback
    'default': { ram: '', battery: '', screenSize: '', camera: '', os: '' }
};

// Akıllı Giriş Bileşeni
const SmartInput = ({ label, value, onChangeText, placeholder, suggestions = [], onSelect }) => {
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
            />
            {suggestions.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.suggestionContainer}
                    contentContainerStyle={{ paddingRight: 20 }}
                >
                    {suggestions.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestionChip}
                            onPress={() => {
                                if (onSelect) {
                                    onSelect(item);
                                } else {
                                    onChangeText(item);
                                }
                            }}
                        >
                            <Text style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

export default function AddProductScreen({ route, navigation }) {
    const { category = '', brand = '', product } = route.params || {};
    const isEditMode = !!product;

    const isSecondHand = category.includes('İkinci El') || category.includes('Yenilenmiş');

    // Debug
    console.log('AddProduct Params:', { category, brand, product });

    // Lowercase convert for easier check
    const catLower = (category || '').toLowerCase();
    const brandLower = (brand || '').toLowerCase();


    // Aksesuar/Şarj/Batarya/Kulaklık/Kılıf/Saat/Teknik Servis/Araç İçi kontrolü
    const isAccessory = catLower.includes('şarj') || catLower.includes('adaptör') || catLower.includes('kablo')
        || catLower.includes('powerbank') || catLower.includes('batarya') || catLower.includes('kulaklık')
        || catLower.includes('kılıf') || catLower.includes('ekran koruma') || catLower.includes('saat')
        || catLower.includes('bileklik') || catLower.includes('teknik servis') || catLower.includes('araç')
        || catLower.includes('tutucu') || catLower.includes('transmitter') || catLower.includes('bluetooth')
        || catLower.includes('kamera') || catLower.includes('led') || catLower.includes('bellek')
        || catLower.includes('disk') || catLower.includes('okuyucu') || catLower.includes('hafıza') || catLower.includes('diğer')
        || brandLower.includes('şarj') || brandLower.includes('saat') || brandLower.includes('bileklik')
        || brandLower.includes('kulaklık') || brandLower.includes('kılıf') || brandLower.includes('ekran koruma')
        || brandLower.includes('tutucu') || brandLower.includes('araç') || brandLower.includes('bellek')
        || brandLower.includes('disk') || brandLower.includes('okuyucu') || brandLower.includes('hafıza') || brandLower.includes('diğer');

    // DB Init
    useEffect(() => {
        initDatabase();
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        id: product?.id || null,
        category: category,
        brand: brand,
        model: product?.model || '',
        storage: product?.storage || '',
        ram: product?.ram || '',
        color: product?.color || '',
        screenSize: product?.screenSize || '',
        price: product?.price ? String(product.price) : '',
        buyingPrice: product?.buyingPrice ? String(product.buyingPrice) : '',
        camera: product?.camera || '',
        battery: product?.battery || '',
        os: product?.os || '',
        warranty: product?.warranty || '',
        cosmetic: product?.cosmetic || '',
        batteryHealth: product?.batteryHealth ? String(product.batteryHealth) : '',
        imeiStatus: product?.imeiStatus || '',
        hasBox: product?.hasBox || false,
        hasChangedParts: product?.hasChangedParts || false,
        imageUri: product?.imageUri || null,
        quantity: product?.quantity || 1,
        dateAdded: product?.dateAdded || new Date().toISOString(),
    });

    useEffect(() => {
        initDatabase();
        if (isEditMode && product) {
            setFormData({
                id: product.id,
                category: product.category,
                brand: product.brand,
                model: product.model,
                storage: product.storage,
                ram: product.ram,
                color: product.color,
                screenSize: product.screenSize,
                price: String(product.price),
                buyingPrice: String(product.buyingPrice),
                camera: product.camera,
                battery: product.battery,
                os: product.os,
                warranty: product.warranty,
                cosmetic: product.cosmetic,
                batteryHealth: String(product.batteryHealth),
                imeiStatus: product.imeiStatus,
                hasBox: product.hasBox === 1, // SQLite stores boolean as 0 or 1
                hasChangedParts: product.hasChangedParts === 1,
                imageUri: product.imageUri,
                quantity: product.quantity,
                dateAdded: product.dateAdded,
            });
        }
    }, [isEditMode, product]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Otomatik Doldurma Fonksiyonu
    const handleModelSelect = (selectedModel) => {
        updateField('model', selectedModel);
        const specs = MODEL_SPECS[selectedModel] || MODEL_SPECS['default'];
        setFormData(prev => ({
            ...prev,
            ram: specs.ram || prev.ram,
            battery: specs.battery || prev.battery,
            screenSize: specs.screenSize || prev.screenSize,
            camera: specs.camera || prev.camera,
            os: specs.os || prev.os,
        }));
    };

    const pickImage = async () => {
        // İzin iste
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni vermelisiniz.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            updateField('imageUri', result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        // Basic validation
        if (!formData.model || !formData.price) {
            Alert.alert('Hata', 'Model ve Fiyat alanları boş bırakılamaz.');
            return;
        }

        try {
            if (isEditMode) {
                await updateProduct(formData);
                Alert.alert('Başarılı', 'Ürün güncellendi!');
            } else {
                await addProduct(formData);
                Alert.alert('Başarılı', 'Ürün eklendi!');
            }
            navigation.goBack();
        } catch (error) {
            console.error('Veritabanı işlemi hatası:', error);
            Alert.alert('Hata', 'Ürün kaydedilirken beklenmedik bir sorun oluştu.');
        }
    };

    // Placeholder Logic for Model/Product Name
    let modelPlaceholder = "Örn: 20W Hızlı Şarj Başlığı";
    if (catLower.includes('saat') || catLower.includes('bileklik') || brandLower.includes('saat') || brandLower.includes('bileklik')) {
        modelPlaceholder = "Örn: Apple Watch Series 8 / Mi Band 7";
    } else if (catLower.includes('kılıf') || brandLower.includes('kılıf')) {
        modelPlaceholder = "Örn: iPhone 13 Şeffaf Kılıf";
    } else if (catLower.includes('ekran koruma') || brandLower.includes('ekran koruma')) {
        modelPlaceholder = "Örn: iPhone 14 Hayalet Ekran";
    } else if (catLower.includes('kulaklık') || brandLower.includes('kulaklık')) {
        modelPlaceholder = "Örn: AirPods Pro / Galaxy Buds 2";
    } else if (catLower.includes('teknik servis')) {
        if (brandLower.includes('apple') || brandLower.includes('iphone')) {
            modelPlaceholder = "Örn: iPhone 13 Pro Ekran Tamiri";
        } else if (brandLower.includes('samsung')) {
            modelPlaceholder = "Örn: Samsung S23 Batarya Değişimi";
        } else if (brandLower.includes('xiaomi')) {
            modelPlaceholder = "Örn: Redmi Note 12 Şarj Soketi";
        } else {
            modelPlaceholder = "Örn: Ekran / Batarya Değişimi";
        }
    } else if (catLower.includes('tutucu') || brandLower.includes('tutucu')) {
        modelPlaceholder = "Örn: Magsafe Araç Tutucu / Vantuzlu Telefon Tutucu";
    } else if (catLower.includes('şarj cihazları') || brandLower.includes('şarj cihazları') || catLower.includes('fm transmitter') || brandLower.includes('fm transmitter')) {
        modelPlaceholder = "Örn: 20W Çakmaklık Şarjı / Bluetooth FM Transmitter";
    } else if (catLower.includes('kamera') || brandLower.includes('kamera') || catLower.includes('dash cam') || brandLower.includes('dash cam')) {
        modelPlaceholder = "Örn: 1080p Araç İçi Kamera / Yol Kayıt Kamerası";
    } else if (catLower.includes('led') || brandLower.includes('led') || catLower.includes('ambiyans') || brandLower.includes('ambiyans')) {
        modelPlaceholder = "Örn: Ayak Altı LED Aydınlatma / Torpido Şerit LED";
    } else if (catLower.includes('bluetooth') || brandLower.includes('bluetooth')) {
        modelPlaceholder = "Örn: AUX Bluetooth Kiti / Araç Kiti";
    } else if (catLower.includes('bellek') || brandLower.includes('bellek')) {
        modelPlaceholder = "Örn: Sandisk 64GB USB 3.0";
    } else if (catLower.includes('hafıza kartı') || brandLower.includes('hafıza kartı')) {
        modelPlaceholder = "Örn: Samsung Evo Plus 128GB MicroSD";
    } else if (catLower.includes('okuyucu') || brandLower.includes('okuyucu')) {
        modelPlaceholder = "Örn: Type-C Hafıza Kartı Okuyucu";
    } else if (catLower.includes('disk') || brandLower.includes('disk')) {
        modelPlaceholder = "Örn: WD Elements 1TB HDD";
    } else if (catLower.includes('diğer') || brandLower.includes('diğer')) {
        modelPlaceholder = "Örn: Oyun Konsolu / Akıllı Tartı / Drone";
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{isEditMode ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</Text>
                <Text style={styles.headerSubtitle}>{brand} - {category}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* FOTOĞRAF SEÇİMİ */}
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {formData.imageUri ? (
                        <Image source={{ uri: formData.imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.cameraIcon}>📷</Text>
                            <Text style={styles.imageText}>Fotoğraf Ekle</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* ADET SEÇİMİ */}
                <View style={styles.quantityContainer}>
                    <Text style={styles.label}>Stok Adedi:</Text>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.quantityBtn}
                            onPress={() => updateField('quantity', Math.max(1, formData.quantity - 1))}
                        >
                            <Text style={styles.quantityBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{formData.quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityBtn}
                            onPress={() => updateField('quantity', formData.quantity + 1)}
                        >
                            <Text style={styles.quantityBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* CİHAZ BİLGİLERİ */}
                <Text style={styles.sectionTitle}>Ürün Bilgileri</Text>

                {/* Model - Herkese Lazım */}
                {isAccessory ? (
                    // Aksesuar için Basit Model Girişi (Suggestions olmadan veya generic)
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Model / Ürün Adı</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={modelPlaceholder}
                            value={formData.model}
                            onChangeText={(t) => updateField('model', t)}
                        />
                    </View>
                ) : (
                    // Telefonlar için Akıllı Giriş
                    <SmartInput
                        label="Model"
                        placeholder={`Örn: ${brand === 'Apple' ? 'iPhone 13' : 'Model Adı'}`}
                        value={formData.model}
                        onChangeText={(t) => updateField('model', t)}
                        suggestions={BRAND_MODELS[brand] || []}
                        onSelect={handleModelSelect}
                    />
                )}

                {/* Aksesuar İse Sadece Fiyatlar */}
                {isAccessory ? (
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Alım Ücreti (TL)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="Örn: 250"
                                value={formData.buyingPrice}
                                onChangeText={(t) => updateField('buyingPrice', t)}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Satış Fiyatı (TL)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="Örn: 500"
                                value={formData.price}
                                onChangeText={(t) => updateField('price', t)}
                            />
                        </View>
                    </View>
                ) : (
                    // TELEFON İSE DETAYLI FORM
                    <>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <SmartInput
                                    label="Depolama"
                                    placeholder="128 GB"
                                    value={formData.storage}
                                    onChangeText={(t) => updateField('storage', t)}
                                    suggestions={STORAGE_OPTIONS}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <SmartInput
                                    label="RAM"
                                    placeholder="8 GB"
                                    value={formData.ram}
                                    onChangeText={(t) => updateField('ram', t)}
                                    suggestions={RAM_OPTIONS}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Renk</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Örn: Mavi"
                                    value={formData.color}
                                    onChangeText={(t) => updateField('color', t)}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Ekran Boyutu</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Örn: 6.1 inç"
                                    value={formData.screenSize}
                                    onChangeText={(t) => updateField('screenSize', t)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Fiyat (TL)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="Örn: 35000"
                                value={formData.price}
                                onChangeText={(t) => updateField('price', t)}
                            />
                        </View>

                        {/* Detaylar */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Kamera</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: 12MP + 12MP"
                                value={formData.camera}
                                onChangeText={(t) => updateField('camera', t)}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Batarya (mAh)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="Örn: 3095"
                                    value={formData.battery}
                                    onChangeText={(t) => updateField('battery', t)}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>İşletim Sistemi</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Örn: iOS 16"
                                    value={formData.os}
                                    onChangeText={(t) => updateField('os', t)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Garanti Durumu</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: 2 Yıl Apple Türkiye"
                                value={formData.warranty}
                                onChangeText={(t) => updateField('warranty', t)}
                            />
                        </View>

                        {/* İKİNCİ EL / YENİLENMİŞ EKSTRALAR - Sadece telefonlarda kalsın */}
                        {isSecondHand && (
                            <View style={styles.extraSection}>
                                <Text style={[styles.sectionTitle, { color: '#d63031' }]}>
                                    İkinci El Durumu
                                </Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Kozmetik Durum</Text>
                                    <View style={styles.segmentContainer}>
                                        {['A Class', 'B Class', 'C Class'].map((opt) => (
                                            <TouchableOpacity
                                                key={opt}
                                                style={[
                                                    styles.segmentButton,
                                                    formData.cosmetic === opt && styles.segmentButtonActive
                                                ]}
                                                onPress={() => updateField('cosmetic', opt)}
                                            >
                                                <Text style={[
                                                    styles.segmentText,
                                                    formData.cosmetic === opt && styles.segmentTextActive
                                                ]}>{opt.split(' ')[0]}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                        <Text style={styles.label}>Pil Sağlığı (%)</Text>
                                        <TextInput
                                            style={styles.input}
                                            keyboardType="numeric"
                                            placeholder="85"
                                            value={formData.batteryHealth}
                                            onChangeText={(t) => updateField('batteryHealth', t)}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>IMEI</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Kayıtlı / YD"
                                            value={formData.imeiStatus}
                                            onChangeText={(t) => updateField('imeiStatus', t)}
                                        />
                                    </View>
                                </View>

                                <View style={styles.switchRow}>
                                    <Text style={styles.label}>Kutu / Şarj Aleti Var mı?</Text>
                                    <Switch
                                        value={formData.hasBox}
                                        onValueChange={(v) => updateField('hasBox', v)}
                                    />
                                </View>

                                <View style={styles.switchRow}>
                                    <Text style={styles.label}>Değişen Parça Var mı?</Text>
                                    <Switch
                                        value={formData.hasChangedParts}
                                        onValueChange={(v) => updateField('hasChangedParts', v)}
                                        trackColor={{ false: "#767577", true: "#ff7675" }}
                                    />
                                </View>
                            </View>
                        )}
                    </>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <LinearGradient
                        colors={['#0984e3', '#00cec9']}
                        style={styles.saveGradient}
                    >
                        <Text style={styles.saveButtonText}>💾 Veritabanına Kaydet</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
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
    headerSubtitle: {
        fontSize: 14,
        color: '#636e72',
        marginTop: 4,
    },
    content: {
        padding: 20,
        paddingBottom: 50,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0984e3',
        marginBottom: 15,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#636e72',
        marginBottom: 5,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#f5f6fa',
        borderWidth: 1,
        borderColor: '#dcdde1',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#2f3542',
    },
    row: {
        flexDirection: 'row',
    },
    // Image Picker Styles
    imagePicker: {
        width: '100%',
        height: 200,
        backgroundColor: '#f1f2f6',
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ced6e0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    cameraIcon: {
        fontSize: 40,
        marginBottom: 10,
    },
    imageText: {
        color: '#a4b0be',
        fontWeight: 'bold',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    // Quantity Styles
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        justifyContent: 'space-between',
        backgroundColor: '#f5f6fa',
        padding: 10,
        borderRadius: 10,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityBtn: {
        backgroundColor: '#dfe6e9',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityBtnText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    quantityValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 15,
    },
    extraSection: {
        marginTop: 20,
        backgroundColor: '#fff0f0',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fab1a0',
    },
    segmentContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 2,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    segmentButtonActive: {
        backgroundColor: '#d63031',
    },
    segmentText: {
        color: '#636e72',
        fontWeight: '600',
    },
    segmentTextActive: {
        color: '#fff',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
    },
    saveButton: {
        marginTop: 30,
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    // Suggestion Styles
    suggestionContainer: {
        marginTop: 8,
        flexDirection: 'row',
    },
    suggestionChip: {
        backgroundColor: '#e17055', // Hafif turuncu/terra color for distinction
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 8,
    },
    suggestionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
