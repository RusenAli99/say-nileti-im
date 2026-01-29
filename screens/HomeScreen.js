import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 1, title: 'Telefonlar', icon: '📱' },
  { id: 2, title: 'Şarj & Batarya', icon: '🔋' },
  { id: 3, title: 'Kulaklık & Ses', icon: '🎧' },
  { id: 4, title: 'Kılıf & Ekran Koruma', icon: '🛡️' },
  { id: 5, title: 'Akıllı Saat & Bileklik', icon: '⌚' },
  { id: 6, title: 'Hat & Operatör', icon: '📶' },
  { id: 7, title: 'Teknik Servis', icon: '🧰' },
  { id: 8, title: 'Araç İçi', icon: '🚗' },
  { id: 9, title: 'Hafıza & Depolama', icon: '💾' },
  { id: 10, title: 'Diğer Aksesuarlar', icon: '🎮' },
];

export default function HomeScreen({ route, navigation }) {
  const showWelcome = route.params?.showWelcome || false;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (showWelcome) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: -100,
              duration: 800,
              useNativeDriver: true,
            }),
          ]).start();
        }, 1500);
      });
    }
  }, [showWelcome]);

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryDetail', { title: category.title });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/logo-splash.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Sayın İletişim</Text>
            <Text style={styles.headerSubtitle}>Stok Takip Sistemi</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handleCategoryPress(cat)}
          >
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.cardGradient}
            >
              <Text style={styles.cardIcon}>{cat.icon}</Text>
              <Text style={styles.cardTitle}>{cat.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Animasyonlu Karşılama Bandı */}
      <Animated.View
        style={[
          styles.toastContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.toastText}>Sayın İletişime HOŞGELDİNİZ</Text>
      </Animated.View>

      {/* ALT BAR (DOCK) */}
      <View style={styles.bottomDock}>
        {/* Kasa Butonu */}
        <TouchableOpacity
          style={styles.dockButton}
          onPress={() => navigation.navigate('Finance')}
        >
          <LinearGradient colors={['#e17055', '#fab1a0']} style={styles.dockGradient}>
            <Text style={styles.dockIcon}>💰</Text>
            <Text style={styles.dockText}>Kasa</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Veresiye Butonu */}
        <TouchableOpacity
          style={styles.dockMainButton}
          onPress={() => navigation.navigate('Veresiye')}
        >
          <LinearGradient colors={['#d63031', '#ff7675']} style={styles.dockMainGradient}>
            <Text style={styles.dockMainIcon}>📒</Text>
            <Text style={styles.dockMainText}>Veresiye</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Not Butonu */}
        <TouchableOpacity
          style={styles.dockButton}
          onPress={() => navigation.navigate('Notes')}
        >
          <LinearGradient colors={['#6c5ce7', '#a29bfe']} style={styles.dockGradient}>
            <Text style={styles.dockIcon}>📝</Text>
            <Text style={styles.dockText}>Not</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 10,
    flexDirection: 'row', // Added for horizontal layout
    justifyContent: 'space-between', // Added to space items
    alignItems: 'center', // Added to vertically align items
  },
  headerContent: { // Renamed from headerRow to better reflect its purpose
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  headerTextContainer: {
    // flex: 1, // Removed as it might push the settings button too far
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 2,
  },
  settingsButton: {
    padding: 10,
    backgroundColor: '#f1f2f6',
    borderRadius: 10,
  },
  settingsIcon: {
    fontSize: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
  },
  card: {
    width: (width - 45) / 2, // 2 kolon, aralarda boşluk hesabı
    height: 140,
    marginBottom: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    textAlign: 'center',
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 91, 234, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 1000,
    elevation: 10,
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Bottom Dock Styles
  bottomDock: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  dockButton: {
    alignItems: 'center',
    marginBottom: 10,
  },
  dockGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  dockIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  dockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dockMainButton: {
    alignItems: 'center',
    bottom: 15, // Hafif yukarı taşsın
  },
  dockMainGradient: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#d63031",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#f5f7fa', // Arka planla kaynaşması için border
  },
  dockMainIcon: {
    fontSize: 32,
    marginBottom: 2,
  },
  dockMainText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  }
});
