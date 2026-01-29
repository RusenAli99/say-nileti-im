import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const [noButtonPosition, setNoButtonPosition] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);

    const handleNoPress = () => {
        // Rastgele yeni pozisyon hesapla (ekran sınırları içinde)
        const randomX = Math.floor(Math.random() * (width - 150));
        const randomY = Math.floor(Math.random() * (height - 150));
        setNoButtonPosition({ top: randomY, left: randomX });
    };

    const handleYesPress = () => {
        navigation.replace('Home', { showWelcome: true }); // Home'a parametre gönderiyoruz
    };

    const renderNoButton = (isAbsolute = false) => (
        <TouchableOpacity
            style={[
                styles.buttonWrapper,
                isAbsolute ? { position: 'absolute', ...noButtonPosition, zIndex: 999 } : {}
            ]}
            onPressIn={handleNoPress}
            activeOpacity={1}
        >
            <LinearGradient
                colors={['#FF512F', '#DD2476']} // Kırmızı-Pembe gradient
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.buttonText}>İyi Değilim</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            // Daha canlı ve teknolojik duran hafif mavi gradient (Buz Mavisi)
            colors={['#E0EAFC', '#CFDEF3']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.contentContainer}>
                    {/* Logo container stili kaldırıldı, direkt logo */}
                    <View style={styles.brandingContainer}>
                        <Image
                            source={require('../assets/logo-splash.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.title}>
                        Sayın Yusuf Sayın abi{'\n'}
                        <Text style={styles.subtitle}>Nasılsın, iyi misin?</Text>
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            onPress={handleYesPress}
                        >
                            <LinearGradient
                                colors={['#11998e', '#38ef7d']} // Yeşil tonları gradient
                                style={styles.gradientButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.buttonText}>İyiyim</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {!noButtonPosition && renderNoButton(false)}
                    </View>

                    {noButtonPosition && renderNoButton(true)}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    brandingContainer: {
        marginBottom: 40,
        // Ekstra arka plan, shadow vs. kaldırıldı
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 280, // Logo biraz daha büyütüldü
        height: 280,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 60,
        color: '#333',
        lineHeight: 36,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        fontSize: 22,
        fontWeight: '500',
        color: '#555',
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        minHeight: 80,
    },
    buttonWrapper: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    gradientButton: {
        paddingVertical: 15,
        paddingHorizontal: 35,
        borderRadius: 30,
        minWidth: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginVertical: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
