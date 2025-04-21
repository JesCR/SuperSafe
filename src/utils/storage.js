import { openDB } from 'idb';

// Abrir una base de datos para la extensión (si no existe, crearla)
const dbPromise = openDB('SuperSeedWalletDB', 1, {
  upgrade(db) {
    // Almacén para las billeteras
    db.createObjectStore('wallets', { keyPath: 'id', autoIncrement: true });
    // Almacén para configuraciones
    db.createObjectStore('settings', { keyPath: 'id' });
  }
});

// Guardar la matriz de billeteras en el almacenamiento
export async function saveWallets(wallets) {
  try {
    const db = await dbPromise;
    const tx = db.transaction('wallets', 'readwrite');
    // Limpiar el almacén existente y volver a agregar todo
    await tx.objectStore('wallets').clear();
    for (const [index, w] of wallets.entries()) {
      await tx.objectStore('wallets').add({ id: index, ...w });
    }
    await tx.done;
    return true;
  } catch (error) {
    console.error("Error al guardar las billeteras:", error);
    return false;
  }
}

// Cargar billeteras desde el almacenamiento
export async function loadWallets() {
  try {
    const db = await dbPromise;
    const tx = db.transaction('wallets', 'readonly');
    const store = tx.objectStore('wallets');
    const all = await store.getAll();
    await tx.done;
    
    // Devolvemos los registros sin el campo ID
    return all.map(record => {
      const { id, ...wallet } = record;
      return wallet;
    });
  } catch (error) {
    console.error("Error al cargar las billeteras:", error);
    return [];
  }
}

// Guardar configuración específica
export async function saveSetting(key, value) {
  try {
    const db = await dbPromise;
    const tx = db.transaction('settings', 'readwrite');
    await tx.objectStore('settings').put({ id: key, value });
    await tx.done;
    return true;
  } catch (error) {
    console.error(`Error al guardar configuración ${key}:`, error);
    return false;
  }
}

// Cargar configuración específica
export async function loadSetting(key) {
  try {
    const db = await dbPromise;
    const value = await db.get('settings', key);
    return value ? value.value : null;
  } catch (error) {
    console.error(`Error al cargar configuración ${key}:`, error);
    return null;
  }
}

// Cargar todas las configuraciones
export async function loadAllSettings() {
  try {
    const db = await dbPromise;
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const all = await store.getAll();
    await tx.done;
    
    const settings = {};
    all.forEach(item => {
      settings[item.id] = item.value;
    });
    
    return settings;
  } catch (error) {
    console.error("Error al cargar todas las configuraciones:", error);
    return {};
  }
} 