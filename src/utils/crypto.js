import { ethers } from 'ethers';
import { loadSetting, saveSetting } from './storage';

// Clave predeterminada para encriptación (se debería cambiar por una contraseña del usuario)
const DEFAULT_PASSWORD_KEY = 'walletPassword';

// Obtener la contraseña del usuario o usar una predeterminada
export async function getEncryptionPassword() {
  // Intentar cargar una contraseña guardada
  let password = await loadSetting(DEFAULT_PASSWORD_KEY);
  if (!password) {
    // Si no hay una contraseña guardada, usamos una predeterminada segura
    // (Esto es solo para demostración, en producción deberíamos pedir al usuario que cree una)
    password = "default-secure-password-" + Math.random().toString(36).substring(2);
    await saveSetting(DEFAULT_PASSWORD_KEY, password);
  }
  return password;
}

// Encriptar una clave privada usando ethers.js
export async function encryptPrivateKey(privateKey) {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const password = await getEncryptionPassword();
    return await wallet.encrypt(password);  // Devuelve una cadena JSON (formato Keystore)
  } catch (error) {
    console.error("Error al encriptar la clave privada:", error);
    throw new Error("No se pudo encriptar la clave privada");
  }
}

// Desencriptar el keystore JSON encriptado para recuperar la clave privada
export async function decryptPrivateKey(encryptedJson) {
  try {
    const password = await getEncryptionPassword();
    return await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
  } catch (error) {
    console.error("Error al desencriptar la clave privada:", error);
    throw new Error("No se pudo desencriptar la clave privada. La contraseña puede ser incorrecta.");
  }
}

// Validar si una clave privada es válida
export function isValidPrivateKey(key) {
  try {
    new ethers.Wallet(key);
    return true;
  } catch {
    return false;
  }
}

// Validar si una frase semilla (mnemónico) es válida
export function isValidMnemonic(mnemonic) {
  return ethers.utils.isValidMnemonic(mnemonic);
}

// Validar si una dirección es válida
export function isValidAddress(address) {
  return ethers.utils.isAddress(address);
} 