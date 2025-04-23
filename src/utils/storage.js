// Helper functions for storing and retrieving data from localStorage

// Save wallets to localStorage
export const saveWallets = (wallets) => {
  try {
    localStorage.setItem('wallets', JSON.stringify(wallets));
    return true;
  } catch (error) {
    console.error('Error saving wallets:', error);
    return false;
  }
};

// Load wallets from localStorage
export const loadWallets = () => {
  try {
    const walletsData = localStorage.getItem('wallets');
    if (!walletsData) return [];
    return JSON.parse(walletsData);
  } catch (error) {
    console.error('Error loading wallets:', error);
    return [];
  }
};

// Hash a password using PBKDF2
export const hashPassword = async (password) => {
  try {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Generar un salt aleatorio
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    
    // Importar la contraseña como clave
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derivar bits usando PBKDF2
    const iterations = 210000; // Un número alto de iteraciones para hacer más lento el proceso
    const hashBuffer = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 256 bits
    );
    
    // Convertir a formato string para almacenamiento
    const hashArray = new Uint8Array(hashBuffer);
    
    // Combinar salt y hash
    const result = new Uint8Array(salt.length + hashArray.length);
    result.set(salt, 0);
    result.set(hashArray, salt.length);
    
    // Convertir a Base64 para almacenamiento
    return btoa(String.fromCharCode.apply(null, result));
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};

// Verify a password against a stored hash
export const verifyPassword = async (password, storedHash) => {
  try {
    if (!storedHash) return false;
    
    // Decodificar el hash almacenado
    const storedData = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
    
    // Extraer el salt (primeros 16 bytes)
    const salt = storedData.slice(0, 16);
    const storedHashPart = storedData.slice(16);
    
    // Repetir el proceso de hash con el mismo salt
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Importar la contraseña como clave
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derivar bits usando PBKDF2 con el mismo salt y parámetros
    const iterations = 210000;
    const hashBuffer = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    // Convertir a array para comparación
    const hashArray = new Uint8Array(hashBuffer);
    
    // Comparar los hashes (comparación de tiempo constante)
    if (hashArray.length !== storedHashPart.length) {
      return false;
    }
    
    // Comparación resistente a timing attacks
    let result = 0;
    for (let i = 0; i < hashArray.length; i++) {
      result |= hashArray[i] ^ storedHashPart[i];
    }
    
    return result === 0;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

// Save a setting to localStorage
export const saveSetting = async (key, value) => {
  try {
    localStorage.setItem(`setting_${key}`, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving setting ${key}:`, error);
    return false;
  }
};

// Load a setting from localStorage
export const loadSetting = async (key) => {
  try {
    const data = localStorage.getItem(`setting_${key}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading setting ${key}:`, error);
    return null;
  }
};

// Load all settings with a specific prefix
export const loadAllSettings = async (prefix = 'setting_') => {
  try {
    const settings = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(prefix)) {
        const actualKey = key.substring(prefix.length);
        settings[actualKey] = JSON.parse(localStorage.getItem(key));
      }
    }
    return settings;
  } catch (error) {
    console.error('Error loading all settings:', error);
    return {};
  }
};

// Clear all stored data (for logging out or resetting)
export const clearStorage = () => {
  try {
    // Clear wallet-related data but keep other app settings
    localStorage.removeItem('wallets');
    localStorage.removeItem('setting_currentWalletIndex');
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

// Check if storage is available
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}; 