import { ethers } from 'ethers';
import { loadSetting } from './storage';

// Default key for encryption (should be changed to user password)
const DEFAULT_PASSWORD_KEY = 'walletPassword';

// Get the user password or use a default one
export async function getEncryptionPassword() {
  // Try to load a saved password
  let password = await loadSetting(DEFAULT_PASSWORD_KEY);
  if (!password) {
    // If no password is saved, use a secure default
    // (This is only for demonstration, in production we should ask the user to create one)
    password = "default-secure-password-" + Math.random().toString(36).substring(2);
    // No guardamos automáticamente esta contraseña aleatoria
  }
  return password;
}

// Derive an encryption key from the user's password
async function deriveKey(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Use SubtleCrypto to derive a key using PBKDF2
  const salt = encoder.encode('SuperSafe-Salt'); // In production, use a random salt and store it
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt the private key with AES-GCM using the user's password
export async function encryptPrivateKey(privateKey, userPassword) {
  try {
    if (!privateKey || typeof privateKey !== 'string') {
      throw new Error("Invalid private key format");
    }
    
    // Si no se proporciona una contraseña específica, intentar obtener la almacenada
    const password = userPassword || await getEncryptionPassword();
    
    // Si no hay contraseña, no podemos cifrar
    if (!password) {
      throw new Error("No password available for encryption");
    }
    
    // Generate a random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Derive a key from the password
    const key = await deriveKey(password);
    
    // Prepare the data to encrypt
    const encoder = new TextEncoder();
    const cleanKey = privateKey.startsWith('0x') ? privateKey.substring(2) : privateKey;
    const data = encoder.encode(cleanKey);
    
    // Encrypt the private key
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    
    // Combine IV and encrypted data for storage
    const encryptedArray = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
    encryptedArray.set(iv, 0);
    encryptedArray.set(new Uint8Array(encryptedBuffer), iv.byteLength);
    
    // Convert to Base64 for storage
    return btoa(String.fromCharCode.apply(null, encryptedArray));
  } catch (error) {
    console.error("Error encrypting private key:", error);
    throw new Error(`Could not encrypt private key: ${error.message}`);
  }
}

// Decrypt the private key with AES-GCM using the user's password
export async function decryptPrivateKey(encryptedData, userPassword) {
  try {
    if (!encryptedData) {
      throw new Error("No encrypted data provided");
    }
    
    // Si no se proporciona una contraseña específica, intentar obtener la almacenada
    const password = userPassword || await getEncryptionPassword();
    
    // Si no hay contraseña, no podemos descifrar
    if (!password) {
      throw new Error("No password available for decryption");
    }
    
    // Convert from Base64 to array
    const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = encryptedBytes.slice(0, 12);
    const data = encryptedBytes.slice(12);
    
    // Derive the key from the password
    const key = await deriveKey(password);
    
    // Decrypt the private key
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    
    // Convert to string
    const decoder = new TextDecoder();
    const privateKey = '0x' + decoder.decode(decryptedBuffer);
    
    // Create a wallet from the decrypted key
    return new ethers.Wallet(privateKey);
  } catch (error) {
    console.error("Error decrypting private key:", error);
    throw new Error("Could not decrypt private key. The password might be incorrect.");
  }
}

// Validate if a private key is valid
export function isValidPrivateKey(key) {
  try {
    const wallet = new ethers.Wallet(key);
    // If no error and we have a wallet, the key is valid
    return !!wallet.address;
  } catch (error) {
    console.log('Private key validation failed:', error.message);
    return false;
  }
}

// Validate if a mnemonic phrase is valid
export function isValidMnemonic(mnemonic) {
  try {
    return ethers.utils.isValidMnemonic(mnemonic);
  } catch (error) {
    return false;
  }
}

// Validate if an address is valid
export function isValidAddress(address) {
  return ethers.utils.isAddress(address);
} 