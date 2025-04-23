import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { NETWORKS, PRELOADED_TOKENS } from '../utils/networks';
import { saveWallets, loadWallets, saveSetting, loadSetting, hashPassword, verifyPassword } from '../utils/storage';
import { encryptPrivateKey, decryptPrivateKey, isValidMnemonic, isValidPrivateKey } from '../utils/crypto';

// Key to store the password
const DEFAULT_PASSWORD_KEY = 'walletPassword';

// Create the context
const WalletContext = createContext();

// Custom hook to use the context
export const useWallet = () => useContext(WalletContext);

// Wallet context provider
export function WalletProvider({ children }) {
  // State for wallets and current selections
  const [wallets, setWallets] = useState([]);
  const [currentWalletIndex, setCurrentWalletIndex] = useState(null);
  const [networkKey, setNetworkKey] = useState('mainnet');
  const [customTokens, setCustomTokens] = useState({ mainnet: [], devnet: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [securityToggles, setSecurityToggles] = useState({
    lockOnExit: true,
    confirmTransactions: true,
    hideBalances: false,
    requestPasswordOnOpen: true,
    autoLockAfter5Min: true
  });

  // Get current network based on network key
  const network = useMemo(() => NETWORKS[networkKey], [networkKey]);

  // Get default + custom tokens for current network
  const tokens = useMemo(() => {
    const preloaded = PRELOADED_TOKENS[networkKey] || [];
    const custom = customTokens[networkKey] || [];
    return [...preloaded, ...custom];
  }, [networkKey, customTokens]);

  // Get current wallet
  const currentWallet = useMemo(() => {
    if (currentWalletIndex === null || !wallets.length) return null;
    return wallets[currentWalletIndex];
  }, [wallets, currentWalletIndex]);

  // Load wallets and settings from storage on mount
  useEffect(() => {
    async function initialize() {
      try {
        // Load wallets
        const storedWallets = await loadWallets();
        if (storedWallets && storedWallets.length > 0) {
          setWallets(storedWallets);
          
          // Load current wallet index
          const storedIndex = await loadSetting('currentWalletIndex');
          if (storedIndex !== null && storedIndex < storedWallets.length) {
            setCurrentWalletIndex(storedIndex);
          } else {
            setCurrentWalletIndex(0); // Default to first wallet
          }
          
          // Load current network
          const storedNetwork = await loadSetting('networkKey');
          if (storedNetwork && NETWORKS[storedNetwork]) {
            setNetworkKey(storedNetwork);
          }
          
          // Load custom tokens
          const storedTokens = await loadSetting('customTokens');
          if (storedTokens) {
            setCustomTokens(storedTokens);
          }
          
          // Check if password is set
          const hasStoredPassword = await loadSetting(DEFAULT_PASSWORD_KEY);
          setHasPassword(!!hasStoredPassword);
          
          // Verify security configuration
          const storedSecurityToggles = await loadSetting('securityToggles');
          if (storedSecurityToggles) {
            setSecurityToggles(storedSecurityToggles);
          }
          
          // If there's a password and lockOnExit is enabled, lock the wallet
          // If lockOnExit is disabled, don't lock even if there's a password
          if (hasStoredPassword) {
            // By default, lock if there's no specific configuration
            if (!storedSecurityToggles || storedSecurityToggles.requestPasswordOnOpen) {
              setIsLocked(true);
            } else {
              setIsLocked(false);
            }
          } else {
            // No password, not locked
            setIsLocked(false);
          }
        } else {
          // No wallets, not locked
          setIsLocked(false);
        }
      } catch (error) {
        console.error('Error initializing wallet context:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    initialize();
  }, []);

  // Save wallets when they change
  useEffect(() => {
    if (!isLoading) {
      saveWallets(wallets);
    }
  }, [wallets, isLoading]);

  // Save current wallet index when it changes
  useEffect(() => {
    if (!isLoading && currentWalletIndex !== null) {
      saveSetting('currentWalletIndex', currentWalletIndex);
    }
  }, [currentWalletIndex, isLoading]);

  // Save current network when it changes
  useEffect(() => {
    if (!isLoading) {
      saveSetting('networkKey', networkKey);
    }
  }, [networkKey, isLoading]);

  // Save custom tokens when they change
  useEffect(() => {
    if (!isLoading) {
      saveSetting('customTokens', customTokens);
    }
  }, [customTokens, isLoading]);

  // Save changes to security settings when they change
  useEffect(() => {
    if (!isLoading) {
      saveSetting('securityToggles', securityToggles);
    }
  }, [securityToggles, isLoading]);

  // Auto-lock after 5 minutes of inactivity
  useEffect(() => {
    if (hasPassword) {
      const lockTimer = setTimeout(() => {
        setIsLocked(true);
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearTimeout(lockTimer);
    }
  }, [hasPassword, isLocked]);

  // Handle window close (lock if lockOnExit is enabled)
  useEffect(() => {
    async function handleBeforeUnload() {
      try {
        // Load security configuration
        const storedSecurityToggles = await loadSetting('securityToggles');
        
        // If lockOnExit is enabled, lock the wallet
        if (storedSecurityToggles && storedSecurityToggles.lockOnExit && hasPassword) {
          setIsLocked(true);
        }
      } catch (error) {
        console.error('Error handling window unload:', error);
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasPassword]);

  // Switch network
  const switchNetwork = (netKey) => {
    if (NETWORKS[netKey]) {
      setNetworkKey(netKey);
    } else {
      console.error(`Invalid network: ${netKey}`);
    }
  };

  // Set or change password
  const setPassword = async (password, oldPassword = null) => {
    try {
      // Si ya tenemos una contraseña, verificamos la antigua
      if (hasPassword && oldPassword !== null) {
        // Verificar la contraseña anterior
        const storedPasswordHash = await loadSetting(DEFAULT_PASSWORD_KEY);
        if (storedPasswordHash) {
          const isValid = await verifyPassword(oldPassword, storedPasswordHash);
          if (!isValid) {
            throw new Error('Current password is incorrect');
          }
        }
      }
      
      // Generar hash de la nueva contraseña
      const passwordHash = await hashPassword(password);
      
      // Guardar el hash de la contraseña
      await saveSetting(DEFAULT_PASSWORD_KEY, passwordHash);
      
      // Actualizar el estado
      setHasPassword(true);
      setIsLocked(false);
      
      return true;
    } catch (error) {
      console.error('Error setting password:', error);
      return false;
    }
  };

  // Unlock with password
  const unlock = async (password) => {
    try {
      // Validación básica de la contraseña
      if (!password || password.length < 3) {
        setPasswordError('Invalid password. Must be at least 3 characters.');
        return false;
      }
      
      // Obtener el hash almacenado
      const storedPasswordHash = await loadSetting(DEFAULT_PASSWORD_KEY);
      
      if (!storedPasswordHash) {
        setPasswordError('No password has been set for this wallet');
        return false;
      }
      
      // Verificar la contraseña contra el hash almacenado
      const isValid = await verifyPassword(password, storedPasswordHash);
      
      if (!isValid) {
        setPasswordError('Invalid password');
        return false;
      }
      
      setIsLocked(false);
      setPasswordError('');
      return true;
    } catch (error) {
      console.error('Error unlocking:', error);
      setPasswordError('Invalid password');
      return false;
    }
  };

  // Lock wallet
  const lock = () => {
    if (hasPassword) {
      setIsLocked(true);
    }
  };

  // Add a new wallet
  const addWallet = async (walletData) => {
    try {
      // For backward compatibility, handle both old and new formats
      const { type, address, privateKey, alias, profileImage } = walletData;
      
      console.log("Adding wallet with data:", { 
        type, 
        address: address ? `${address.substring(0, 8)}...` : undefined,
        hasPrivateKey: !!privateKey,
        alias
      });
      
      // Validate the private key if provided
      let wallet;
      if (type === 'mnemonic' && walletData.secret) {
        if (!isValidMnemonic(walletData.secret.trim())) {
          throw new Error('Invalid mnemonic phrase');
        }
        wallet = ethers.Wallet.fromMnemonic(walletData.secret.trim());
      } else {
        // Default to private key method
        const keyToUse = privateKey || walletData.secret;
        if (!keyToUse) {
          throw new Error('No private key or secret provided');
        }
        
        if (!isValidPrivateKey(keyToUse.trim())) {
          throw new Error('Invalid private key format');
        }
        
        wallet = new ethers.Wallet(keyToUse.trim());
      }
      
      // Use provided address or get from wallet
      const walletAddress = address || wallet.address;
      
      // Check if the address already exists
      if (wallets.some(w => w.address.toLowerCase() === walletAddress.toLowerCase())) {
        throw new Error('This wallet has already been imported');
      }
      
      // Obtener la contraseña actual (si existe)
      const passwordHash = await loadSetting(DEFAULT_PASSWORD_KEY);
      const userPassword = walletData.password; // La contraseña podría ser proporcionada al crear el wallet
      
      // Encrypt the private key
      const encryptedKey = await encryptPrivateKey(wallet.privateKey, userPassword);
      
      // Create the new wallet
      const newWallet = {
        alias: alias || `Wallet ${wallets.length + 1}`,
        address: walletAddress,
        encryptedKey,
        profileImage: profileImage || null
      };
      
      // Update state
      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      setCurrentWalletIndex(updatedWallets.length - 1);
      
      // If this is the first wallet and no password set, prompt for password
      if (updatedWallets.length === 1 && !hasPassword) {
        // In a real implementation, we would prompt for a password here
        // For now, we'll just set a flag that will be checked by the UI
        setHasPassword(true);
        await saveSetting('hasPassword', true);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding wallet:', error);
      throw error;
    }
  };

  // Remove wallet by index
  const removeWallet = (index) => {
    if (index < 0 || index >= wallets.length) {
      console.error('Invalid wallet index for removal');
      return false;
    }
    
    const updatedWallets = wallets.filter((_, i) => i !== index);
    setWallets(updatedWallets);
    
    // Update current index if needed
    if (updatedWallets.length === 0) {
      setCurrentWalletIndex(null);
    } else if (currentWalletIndex === index) {
      setCurrentWalletIndex(0);
    } else if (currentWalletIndex > index) {
      setCurrentWalletIndex(currentWalletIndex - 1);
    }
    
    return true;
  };

  // Update wallet (alias or profile image)
  const updateWallet = (index, updates) => {
    if (index < 0 || index >= wallets.length) {
      console.error('Invalid wallet index for update');
      return false;
    }
    
    const updatedWallets = [...wallets];
    updatedWallets[index] = { ...updatedWallets[index], ...updates };
    setWallets(updatedWallets);
    
    return true;
  };

  // Add a custom token
  const addToken = (symbol, address, decimals, forNetwork = networkKey) => {
    if (!symbol || !address || !decimals) {
      console.error('Incomplete token data');
      return false;
    }
    
    // Check if token already exists
    const networkTokens = [...PRELOADED_TOKENS[forNetwork] || [], ...customTokens[forNetwork] || []];
    if (networkTokens.some(t => 
      t.address.toLowerCase() === address.toLowerCase() || 
      t.symbol.toLowerCase() === symbol.toLowerCase()
    )) {
      throw new Error('This token has already been added');
    }
    
    // Update custom tokens
    setCustomTokens(prev => ({
      ...prev,
      [forNetwork]: [...(prev[forNetwork] || []), { symbol, address, decimals: Number(decimals) }]
    }));
    
    return true;
  };

  // Remove a custom token
  const removeToken = (address, fromNetwork = networkKey) => {
    setCustomTokens(prev => ({
      ...prev,
      [fromNetwork]: (prev[fromNetwork] || []).filter(
        t => t.address.toLowerCase() !== address.toLowerCase()
      )
    }));
    
    return true;
  };

  // Get provider for current network
  const getProvider = () => {
    return new ethers.providers.JsonRpcProvider(network.rpcUrl);
  };

  // Get signer for current wallet
  const getSigner = async () => {
    if (!currentWallet) throw new Error('No wallet selected');
    if (isLocked) throw new Error('Wallet is locked');
    
    try {
      // Obtener la contraseña actual (si existe)
      const passwordHash = await loadSetting(DEFAULT_PASSWORD_KEY);
      
      // Necesitamos la contraseña en texto plano para descifrar, pero debería
      // estar disponible en memoria durante la sesión actual mientras esté desbloqueada
      // En una implementación real, podríamos utilizar un enfoque más seguro como
      // almacenar la contraseña en una variable de sesión cifrada
      
      // Descifrar la clave privada - aquí falta la contraseña real, pero
      // decryptPrivateKey intentará usar getEncryptionPassword como fallback
      const wallet = await decryptPrivateKey(currentWallet.encryptedKey);
      return wallet.connect(getProvider());
    } catch (error) {
      console.error('Error getting signer:', error);
      throw error;
    }
  };

  // Send ETH
  const sendETH = async (toAddress, amount) => {
    const signer = await getSigner();
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.utils.parseEther(amount)
    });
    return tx;
  };

  // Send ERC-20 token
  const sendToken = async (tokenAddress, toAddress, amount, decimals = 18) => {
    const signer = await getSigner();
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function transfer(address to, uint amount) returns (bool)',
        'function decimals() view returns (uint8)'
      ],
      signer
    );
    
    // If decimals not provided, try to get them from contract
    let tokenDecimals = decimals;
    try {
      if (!decimals) {
        tokenDecimals = await tokenContract.decimals();
      }
    } catch (error) {
      console.warn('Could not get token decimals, using default value:', error);
    }
    
    // Send tokens
    const parsedAmount = ethers.utils.parseUnits(amount, tokenDecimals);
    const tx = await tokenContract.transfer(toAddress, parsedAmount);
    return tx;
  };

  // Provide state and functions to children
  const value = {
    wallets,
    currentWallet,
    currentWalletIndex,
    setCurrentWalletIndex,
    network,
    networkKey,
    tokens,
    isLoading,
    isLocked,
    hasPassword,
    passwordError,
    securityToggles,
    setSecurityToggles,
    
    // Functions
    switchNetwork,
    addWallet,
    removeWallet,
    updateWallet,
    addToken,
    removeToken,
    getProvider,
    getSigner,
    sendETH,
    sendToken,
    setPassword,
    unlock,
    lock,
    saveSetting,
    loadSetting
  };

  // If wallet is locked, render a login screen instead of passing down the context
  if (isLocked && !isLoading) {
    return (
      <div className="min-w-[300px] h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Unlock Your Wallet</h2>
            <p className="text-gray-600">Enter your password to access your wallet</p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const password = e.target.password.value;
            unlock(password);
          }}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input 
                type="password" 
                name="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your password"
                required
              />
            </div>
            
            {passwordError && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {passwordError}
              </div>
            )}
            
            <button 
              type="submit"
              className="w-full bg-[#18d1ce] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#16beb8] focus:outline-none focus:ring-2 focus:ring-[#18d1ce] focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}