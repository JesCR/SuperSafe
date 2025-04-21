import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { NETWORKS, PRELOADED_TOKENS } from '../utils/networks';
import { saveWallets, loadWallets, saveSetting, loadSetting } from '../utils/storage';
import { encryptPrivateKey, decryptPrivateKey, isValidMnemonic, isValidPrivateKey } from '../utils/crypto';

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
          const hasStoredPassword = await loadSetting('hasPassword');
          setHasPassword(!!hasStoredPassword);
          
          // If we have a password, wallet remains locked until unlocked
          setIsLocked(!!hasStoredPassword);
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

  // Auto-lock after 5 minutes of inactivity
  useEffect(() => {
    if (hasPassword) {
      const lockTimer = setTimeout(() => {
        setIsLocked(true);
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearTimeout(lockTimer);
    }
  }, [hasPassword, isLocked]);

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
      // If we already have a password, verify old password
      if (hasPassword && oldPassword !== null) {
        // In a real app, we would verify the old password here
        // For demo purposes, we're just accepting any old password
      }
      
      // Store the password hash (in a real app) and set hasPassword flag
      await saveSetting('hasPassword', true);
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
      // In a real app, we would verify the password against stored hash
      // For demo purposes, we're accepting any password
      
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
      const { address, privateKey, alias } = walletData;
      
      // Check if the address already exists
      if (wallets.some(w => w.address.toLowerCase() === address.toLowerCase())) {
        throw new Error('This wallet has already been imported');
      }
      
      // Encrypt the private key
      const encryptedKey = await encryptPrivateKey(privateKey);
      
      // Create the new wallet
      const newWallet = {
        alias: alias || `Wallet ${wallets.length + 1}`,
        address,
        encryptedKey,
        profileImage: walletData.profileImage || null
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
    lock
  };

  // If wallet is locked, render a login screen instead of passing down the context
  if (isLocked && !isLoading) {
    return (
      <div className="min-w-[300px] h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Unlock Your Wallet</h2>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const password = e.target.password.value;
            unlock(password);
          }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input 
                type="password" 
                name="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {passwordError && (
              <div className="mb-4 text-red-600 text-sm">{passwordError}</div>
            )}
            
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
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