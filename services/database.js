import * as SQLite from 'expo-sqlite';

let db;

export const getDb = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('sayiniletisim.db');
    }
    return db;
};

export const initDatabase = async () => {
    const database = await getDb();
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            brand TEXT NOT NULL,
            model TEXT NOT NULL,
            storage TEXT,
            ram TEXT,
            color TEXT,
            screenSize TEXT,
            camera TEXT,
            battery TEXT,
            os TEXT,
            warranty TEXT,
            price REAL,
            buyingPrice REAL, -- Yeni eklenen alan
            quantity INTEGER DEFAULT 1,
            imageUri TEXT,
            -- Ekstra alanlar (JSON string olarak tutulabilir veya ayrı kolonlar)
            cosmetic TEXT,
            batteryHealth TEXT,
            imeiStatus TEXT,
            hasBox INTEGER, -- 0 veya 1
            hasChangedParts INTEGER -- 0 veya 1
        );
    `);

    // Mevcut tabloya kolon ekleme (Migration logic)
    try {
        await database.execAsync('ALTER TABLE products ADD COLUMN buyingPrice REAL');
    } catch (e) {
        // Kolon zaten varsa hata verir, yoksayıyoruz
    }

    // Notlar Tablosu
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT,
            date TEXT
        );
    `);

    // Finans Tablosu (Gelir/Gider)
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS finance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT, -- 'income' veya 'expense'
            amount REAL,
            description TEXT,
            date TEXT
        );
    `);

    // Müşteriler Tablosu
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            created_at TEXT
        );
    `);

    // Borçlar Tablosu (Detaylı)
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS debts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            date TEXT,
            FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
        );
    `);

    console.log('Veritabanı tablosu hazır.');
};

export const addProduct = async (product) => {
    const database = await getDb();
    const {
        category, brand, model, storage, ram, color, screenSize, camera, battery, os, warranty, price, buyingPrice,
        quantity, imageUri, cosmetic, batteryHealth, imeiStatus, hasBox, hasChangedParts
    } = product;

    try {
        const result = await database.runAsync(
            `INSERT INTO products (
                category, brand, model, storage, ram, color, screenSize, camera, battery, os, warranty, price, buyingPrice,
                quantity, imageUri, cosmetic, batteryHealth, imeiStatus, hasBox, hasChangedParts
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category, brand, model, storage, ram, color, screenSize, camera, battery, os, warranty, price, buyingPrice,
                quantity, imageUri, cosmetic, batteryHealth, imeiStatus, hasBox ? 1 : 0, hasChangedParts ? 1 : 0
            ]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Ürün ekleme hatası:", error);
        throw error;
    }
};

export const getProducts = async (category, brand) => {
    const database = await getDb();
    // Eğer marka 'Diğer' ise veya özel bir durum varsa sorgu değişebilir, şimdilik basit tutuyoruz
    try {
        // Eğer marka seçilmediyse kategoriye göre, marka varsa kategori+markaya göre
        // Şimdilik CategoryDetail'den her türlü brand geliyor (nested list yapısı)
        if (brand) {
            const allRows = await database.getAllAsync('SELECT * FROM products WHERE category = ? AND brand = ?', [category, brand]);
            return allRows;
        } else {
            // Sadece ana kategoride (henüz bu senaryo yok ama hazırlık)
            const allRows = await database.getAllAsync('SELECT * FROM products WHERE category = ?', [category]);
            return allRows;
        }
    } catch (error) {
        console.error("Ürün listeleme hatası:", error);
        return [];
    }
};

export const deleteProduct = async (id) => {
    const database = await getDb();
    await database.runAsync('DELETE FROM products WHERE id = ?', [id]);
};

export const updateProduct = async (id, product) => {
    const database = await getDb();
    const {
        category, brand, model, storage, ram, color, screenSize, camera, battery, os, warranty, price, buyingPrice,
        quantity, imageUri, cosmetic, batteryHealth, imeiStatus, hasBox, hasChangedParts
    } = product;

    try {
        await database.runAsync(
            `UPDATE products SET
                category = ?, brand = ?, model = ?, storage = ?, ram = ?, color = ?, screenSize = ?, camera = ?, battery = ?, os = ?, warranty = ?, price = ?, buyingPrice = ?,
                quantity = ?, imageUri = ?, cosmetic = ?, batteryHealth = ?, imeiStatus = ?, hasBox = ?, hasChangedParts = ?
             WHERE id = ?`,
            [
                category, brand, model, storage, ram, color, screenSize, camera, battery, os, warranty, price, buyingPrice,
                quantity, imageUri, cosmetic, batteryHealth, imeiStatus, hasBox ? 1 : 0, hasChangedParts ? 1 : 0,
                id
            ]
        );
    } catch (error) {
        console.error("Ürün güncelleme hatası:", error);
        throw error;
    }
};

export const updateStock = async (id, newQuantity) => {
    const database = await getDb();
    try {
        await database.runAsync('UPDATE products SET quantity = ? WHERE id = ?', [newQuantity, id]);
    } catch (error) {
        console.error("Stok güncelleme hatası:", error);
        throw error;
    }
};

// Not İşlemleri
export const addNote = async (text) => {
    const database = await getDb();
    try {
        await database.runAsync('INSERT INTO notes (text, date) VALUES (?, ?)', [text, new Date().toISOString()]);
    } catch (error) {
        console.error("Not ekleme hatası:", error);
        throw error;
    }
};

export const getNotes = async () => {
    const database = await getDb();
    try {
        const allRows = await database.getAllAsync('SELECT * FROM notes ORDER BY id DESC');
        return allRows;
    } catch (error) {
        console.error("Not listeleme hatası:", error);
        return [];
    }
};

export const deleteNote = async (id) => {
    const database = await getDb();
    try {
        await database.runAsync('DELETE FROM notes WHERE id = ?', [id]);
    } catch (error) {
        console.error("Not silme hatası:", error);
        throw error;
    }
};

export const updateNote = async (id, text) => {
    const database = await getDb();
    try {
        await database.runAsync('UPDATE notes SET text = ?, date = ? WHERE id = ?', [text, new Date().toISOString(), id]);
    } catch (error) {
        console.error("Not güncelleme hatası:", error);
        throw error;
    }
};

// Finans İşlemleri
export const addTransaction = async (type, amount, description) => {
    const database = await getDb();
    try {
        await database.runAsync(
            'INSERT INTO finance (type, amount, description, date) VALUES (?, ?, ?, ?)',
            [type, amount, description, new Date().toISOString()]
        );
    } catch (error) {
        console.error("Finans ekleme hatası:", error);
        throw error;
    }
};

export const getTransactions = async () => {
    const database = await getDb();
    try {
        const allRows = await database.getAllAsync('SELECT * FROM finance ORDER BY id DESC');
        return allRows;
    } catch (error) {
        console.error("Finans listeleme hatası:", error);
        return [];
    }
};

export const deleteTransaction = async (id) => {
    const database = await getDb();
    try {
        await database.runAsync('DELETE FROM finance WHERE id = ?', [id]);
    } catch (error) {
        console.error("Finans silme hatası:", error);
        throw error;
    }
};

export const updateTransaction = async (id, type, amount, description) => {
    const database = await getDb();
    try {
        await database.runAsync(
            'UPDATE finance SET type = ?, amount = ?, description = ?, date = ? WHERE id = ?',
            [type, amount, description, new Date().toISOString(), id]
        );
    } catch (error) {
        console.error("Finans güncelleme hatası:", error);
        throw error;
    }
};

// --- VERESİYE İŞLEMLERİ ---

// --- YENİ VERESİYE SİSTEMİ (MÜŞTERİ BAZLI) ---

// Müşteri İşlemleri
export const addCustomer = async (name, phone) => {
    const database = await getDb();
    try {
        const result = await database.runAsync(
            'INSERT INTO customers (name, phone, created_at) VALUES (?, ?, ?)',
            [name, phone, new Date().toISOString()]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Müşteri ekleme hatası:", error);
        throw error;
    }
};

export const getCustomers = async () => {
    const database = await getDb();
    try {
        // Müşterileri ve toplam borçlarını getir
        const allRows = await database.getAllAsync(`
            SELECT c.*, SUM(d.amount) as totalDebt 
            FROM customers c 
            LEFT JOIN debts d ON c.id = d.customer_id 
            GROUP BY c.id 
            ORDER BY c.id DESC
        `);
        return allRows;
    } catch (error) {
        console.error("Müşteri listeleme hatası:", error);
        return [];
    }
};

export const deleteCustomer = async (id) => {
    const database = await getDb();
    try {
        // İlişkili borçlar CASCADE ile silinmeli ama manual de silelim garanti olsun
        await database.runAsync('DELETE FROM debts WHERE customer_id = ?', [id]);
        await database.runAsync('DELETE FROM customers WHERE id = ?', [id]);
    } catch (error) {
        console.error("Müşteri silme hatası:", error);
        throw error;
    }
};

// Borç İşlemleri
export const addDebt = async (customerId, amount, description) => {
    const database = await getDb();
    try {
        await database.runAsync(
            'INSERT INTO debts (customer_id, amount, description, date) VALUES (?, ?, ?, ?)',
            [customerId, amount, description, new Date().toISOString()]
        );
    } catch (error) {
        console.error("Borç ekleme hatası:", error);
        throw error;
    }
};

export const getCustomerDebts = async (customerId) => {
    const database = await getDb();
    try {
        const allRows = await database.getAllAsync(
            'SELECT * FROM debts WHERE customer_id = ? ORDER BY id DESC',
            [customerId]
        );
        return allRows;
    } catch (error) {
        console.error("Borç detayları hatası:", error);
        return [];
    }
};

export const deleteDebt = async (id) => {
    const database = await getDb();
    try {
        await database.runAsync('DELETE FROM debts WHERE id = ?', [id]);
    } catch (error) {
        console.error("Borç silme hatası:", error);
        throw error;
    }
};
