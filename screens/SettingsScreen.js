import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, LogBox } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Deprecation uyarısını gizle (geçici çözüm)
LogBox.ignoreLogs(['Method getInfoAsync imported from "expo-file-system" is deprecated']);
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getDb } from '../services/database';

export default function SettingsScreen({ navigation }) {

    const handleBackup = async () => {
        try {
            // Veritabanı dosyasının yolu
            const dbDir = FileSystem.documentDirectory + 'SQLite/';
            const dbName = 'sayiniletisim.db';
            const dbPath = dbDir + dbName;

            // Dosyanın varlığını kontrol et
            const fileInfo = await FileSystem.getInfoAsync(dbPath);
            if (!fileInfo.exists) {
                Alert.alert('Hata', 'Veritabanı dosyası bulunamadı.');
                return;
            }

            // Paylaşılabilir bir alana kopyala (önbellek)
            const backupPath = FileSystem.cacheDirectory + 'sayiniletisim_yedek.db';
            await FileSystem.copyAsync({
                from: dbPath,
                to: backupPath
            });

            // Paylaş (Google Drive, Mail, WhatsApp vb. seçeneği açar)
            await Sharing.shareAsync(backupPath, {
                mimeType: 'application/x-sqlite3',
                dialogTitle: 'Yedeği Paylaş / Kaydet',
                UTI: 'public.database'
            });

        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Yedekleme sırasında bir sorun oluştu.');
        }
    };

    const handleRestore = async () => {
        try {
            // Dosya seçtir
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Geniş tutuyoruz, bazen .db uzantısı tanınmayabiliyor
                copyToCacheDirectory: true
            });

            if (result.canceled) {
                return;
            }

            const asset = result.assets[0];

            // Basit bir uzantı kontrolü yapabiliriz
            if (!asset.name.endsWith('.db') && !asset.name.endsWith('.sqlite')) {
                Alert.alert('Uyarı', 'Seçilen dosya bir veritabanı dosyası gibi görünmüyor. Yine de devam edilsin mi?', [
                    { text: 'İptal', style: 'cancel' },
                    { text: 'Devam Et', onPress: () => performRestore(asset.uri) }
                ]);
            } else {
                performRestore(asset.uri);
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Dosya seçimi sırasında bir sorun oluştu.');
        }
    };

    const performRestore = async (sourceUri) => {
        try {
            Alert.alert('Dikkat', 'Mevcut verilerinizin üzerine yazılacak. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?', [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'YEDEKLE VE YÜKLE',
                    style: 'destructive',
                    onPress: async () => {
                        // Önce mevcut veritabanını kapatalım (Expo SQLite'da closeAsync yok ama restart gerekebilir)
                        // Hedef yol
                        const dbDir = FileSystem.documentDirectory + 'SQLite/';
                        // Klasör yoksa oluştur
                        const dirInfo = await FileSystem.getInfoAsync(dbDir);
                        if (!dirInfo.exists) {
                            await FileSystem.makeDirectoryAsync(dbDir);
                        }

                        const dbPath = dbDir + 'sayiniletisim.db';

                        // Dosyayı kopyala (üzerine yaz)
                        // Önce var olanı silmek daha güvenli olabilir
                        await FileSystem.deleteAsync(dbPath, { idempotent: true });
                        await FileSystem.copyAsync({
                            from: sourceUri,
                            to: dbPath
                        });

                        Alert.alert('Başarılı', 'Yedek başarıyla geri yüklendi. Uygulamanın değişiklikleri görmesi için yeniden başlatılması gerekebilir.');
                    }
                }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Geri yükleme işlemi başarısız oldu.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ayarlar</Text>
            </View>

            <View style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Veri Yönetimi</Text>
                    <Text style={styles.sectionInfo}>
                        Verilerinizi güvende tutmak için düzenli olarak yedek almanızı öneririz.
                        Yedeği telefonunuza, Google Drive'a veya kendinize mail olarak gönderebilirsiniz.
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={handleBackup}>
                        <LinearGradient colors={['#0984e3', '#74b9ff']} style={styles.gradient}>
                            <Text style={styles.buttonIcon}>☁️</Text>
                            <View>
                                <Text style={styles.buttonTitle}>Yedek Al (Dışa Aktar)</Text>
                                <Text style={styles.buttonSubtitle}>Veritabanını telefona kaydet</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleRestore}>
                        <LinearGradient colors={['#e17055', '#fab1a0']} style={styles.gradient}>
                            <Text style={styles.buttonIcon}>📥</Text>
                            <View>
                                <Text style={styles.buttonTitle}>Yedekten Dön (İçe Aktar)</Text>
                                <Text style={styles.buttonSubtitle}>Önceden alınan yedeği yükle</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Uygulama Bilgisi</Text>
                    <Text style={styles.infoText}>Sayın İletişim Stok Takip v1.0</Text>
                    <Text style={styles.infoText}>Geliştirici: Rusen</Text>
                </View>
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
    container: {
        padding: 20,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 10,
    },
    sectionInfo: {
        fontSize: 14,
        color: '#636e72',
        marginBottom: 20,
        lineHeight: 20,
    },
    button: {
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    buttonIcon: {
        fontSize: 30,
        marginRight: 15,
    },
    buttonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    buttonSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    infoBox: {
        alignItems: 'center',
        marginTop: 20,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b2bec3',
        marginBottom: 5,
    },
    infoText: {
        fontSize: 12,
        color: '#dfe6e9',
        color: '#b2bec3',
    }
});
