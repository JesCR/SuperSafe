import { useState } from 'react';
import { useWallet } from '../contexts/WalletProvider';
import { ethers } from 'ethers';

export default function AddWalletForm({ onComplete }) {
  const { addWallet, wallets, setPassword } = useWallet();
  const [method, setMethod] = useState('create'); // 'create' or 'import'
  const [alias, setAlias] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [walletPassword, setWalletPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWalletPassword, setShowWalletPassword] = useState(false);
  
  // State for showing backup modal
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [walletForBackup, setWalletForBackup] = useState(null);
  const [showBackupKey, setShowBackupKey] = useState(false);

  // Check if this is the first wallet
  const isFirstWallet = wallets.length === 0;

  const handleCreateWallet = async () => {
    if (!alias) {
      setError('Please enter a name for your wallet');
      return;
    }

    // Validate password if this is the first wallet
    if (isFirstWallet) {
      if (!walletPassword) {
        setError('Please set a password for your wallet');
        return;
      }
      
      if (walletPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      
      if (walletPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // Create new random wallet
      const wallet = ethers.Wallet.createRandom();
      
      // Log for debugging
      console.log("Created new wallet:", {
        address: wallet.address,
        privateKey: wallet.privateKey.substring(0, 10) + '...'
      });
      
      // Add wallet to state using the structure expected by WalletProvider
      await addWallet({
        type: 'privateKey',  // We're using private key format
        alias: alias,
        privateKey: wallet.privateKey,
        address: wallet.address,
        password: walletPassword // Pass the password to encrypt the private key
      });
      
      // If this is the first wallet, set password
      if (isFirstWallet && walletPassword) {
        await setPassword(walletPassword);
      }
      
      // Show backup modal
      setWalletForBackup({
        privateKey: wallet.privateKey,
        address: wallet.address,
        mnemonic: wallet.mnemonic?.phrase
      });
      setShowBackupModal(true);
    } catch (err) {
      console.error('Error creating wallet:', err);
      // Show more descriptive error message if available
      setError(err.message || 'Failed to create wallet. Please try again.');
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!alias) {
      setError('Please enter a name for your wallet');
      return;
    }

    if (!privateKey) {
      setError('Please enter your private key');
      return;
    }

    // Validate password if this is the first wallet
    if (isFirstWallet) {
      if (!walletPassword) {
        setError('Please set a password for your wallet');
        return;
      }
      
      if (walletPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      
      if (walletPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // Validate and import wallet from private key
      let formattedKey = privateKey.trim();
      // Add 0x prefix if missing
      if (!formattedKey.startsWith('0x')) {
        formattedKey = `0x${formattedKey}`;
      }
      
      // Check if valid private key
      const wallet = new ethers.Wallet(formattedKey);
      
      // Log for debugging
      console.log("Importing wallet:", {
        address: wallet.address,
        privateKey: formattedKey.substring(0, 10) + '...'
      });
      
      // Add wallet to state using the structure expected by WalletProvider
      await addWallet({
        type: 'privateKey',
        alias: alias,
        privateKey: formattedKey,
        address: wallet.address,
        password: walletPassword // Pass the password to encrypt the private key
      });
      
      // If this is the first wallet, set password
      if (isFirstWallet && walletPassword) {
        await setPassword(walletPassword);
      }
      
      // Show backup modal for imported wallet
      setWalletForBackup({
        privateKey: formattedKey,
        address: wallet.address
      });
      setShowBackupModal(true);
    } catch (err) {
      console.error('Error importing wallet:', err);
      // Show more descriptive error message
      if (err.message.includes('invalid hexlify value')) {
        setError('Invalid private key format. Please check your private key.');
      } else {
        setError(err.message || 'Invalid private key');
      }
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (method === 'create') {
      handleCreateWallet();
    } else {
      handleImportWallet();
    }
  };
  
  // Function to handle completion of process after backup
  const handleBackupComplete = () => {
    setShowBackupModal(false);
    setWalletForBackup(null);
    setLoading(false);
    onComplete();
  };

  // If showing backup modal, render it
  if (showBackupModal && walletForBackup) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] p-6 shadow-xl my-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Backup Your Wallet</h2>
          </div>
          
          <div className="mb-4 overflow-y-auto max-h-[60vh] pr-1">
            <p className="text-red-600 font-medium text-xs mb-2">⚠️ CRITICAL SECURITY INFORMATION</p>
            <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
              <li>Scroll down to save your backup information.</li>
              <li>Write down this backup information and keep it in a safe place.</li>
              <li>Never share your private key or recovery phrase with anyone.</li>
              <li>Anyone with this information can access your funds.</li>
              <li>We do not store your keys. If you lose this information, you will lose access to your wallet.</li>
            </ul>
          
            <div className="mt-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm font-mono break-all border border-gray-200">
                  {walletForBackup.address}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                  <span>Private Key</span>
                  <button
                    onClick={() => setShowBackupKey(!showBackupKey)}
                    className="text-[#18d1ce] text-xs flex items-center"
                  >
                    {showBackupKey ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                        Hide
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Show
                      </>
                    )}
                  </button>
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm font-mono break-all border border-gray-200 relative">
                  {showBackupKey ? (
                    walletForBackup.privateKey
                  ) : (
                    <span className="text-gray-500">••••••••••••••••••••••••••••••••••••••••••••••••••••••••</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This is your private key. Never share it with anyone.
                </p>
              </div>
              
              {walletForBackup.mnemonic && (
                <div className="mb-3">
                  <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Recovery Phrase</span>
                    <button
                      onClick={() => setShowBackupKey(!showBackupKey)}
                      className="text-[#18d1ce] text-xs flex items-center"
                    >
                      {showBackupKey ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                          Hide
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Show
                        </>
                      )}
                    </button>
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm font-mono break-all border border-gray-200">
                    {showBackupKey ? (
                      walletForBackup.mnemonic
                    ) : (
                      <span className="text-gray-500">••••••••••••••••••••••••••••••••••••••••••••••••••••••••</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This is your recovery phrase. Write it down and keep it safe.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleBackupComplete}
              className="bg-[#18d1ce] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#16beb8] focus:outline-none flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              I've Backed Up My Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto p-4 space-y-3">
      {/* Cabecera con logo */}
      <div className="fixed top-0 left-0 right-0 w-full">
        <div className="flex justify-center items-center bg-[#18d1ce] pt-2 pb-0">
          <img src="/SuperSafe_1line-cropped.svg" alt="SuperSafe" className="h-14" />
        </div>
      </div>
      
      {/* Ajustar margen superior para dar espacio a la cabecera fija */}
      <div className="mt-14"></div>
      
      <div className="text-center mb-1">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Welcome to SuperSafe</h1>
        <p className="text-gray-600 text-lg">Create or import a wallet</p>
      </div>
      
      {/* Method Selection */}
      <div className="flex w-full space-x-3 rounded-lg overflow-hidden shadow-sm">
        <button
          type="button"
          className={`flex-1 py-2 px-3 text-center font-medium transition-colors duration-200 flex items-center justify-center ${
            method === 'create'
              ? 'bg-[#18d1ce] text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
          onClick={() => setMethod('create')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Create New
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-3 text-center font-medium transition-colors duration-200 flex items-center justify-center ${
            method === 'import'
              ? 'bg-[#18d1ce] text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
          onClick={() => setMethod('import')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import Existing
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {/* Wallet Name */}
        <div>
          <label htmlFor="alias" className="block text-sm font-medium text-gray-700 mb-0.5">
            Wallet Name
          </label>
          <input
            type="text"
            id="alias"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#18d1ce] focus:border-[#18d1ce] transition-all duration-200"
            placeholder="My Wallet"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
        </div>

        {/* Private Key Input (only for import) */}
        {method === 'import' && (
          <div>
            <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700 mb-0.5">
              Private Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="privateKey"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#18d1ce] focus:border-[#18d1ce] transition-all duration-200"
                placeholder="Enter your private key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              Enter your hexadecimal private key (with or without 0x)
            </p>
          </div>
        )}

        {/* Password Fields (only for first wallet) */}
        {isFirstWallet && (
          <>
            <div className="border-t pt-2 mt-2">
              <h3 className="font-medium text-sm text-gray-700 mb-1">Secure Your Wallet</h3>
              <p className="text-xs text-gray-500 mb-2">
                Set a password to encrypt your wallet. You'll need this password to unlock your wallet after it locks automatically.
              </p>
            </div>
            
            <div>
              <label htmlFor="walletPassword" className="block text-sm font-medium text-gray-700 mb-0.5">
                Wallet Password
              </label>
              <div className="relative">
                <input
                  type={showWalletPassword ? "text" : "password"}
                  id="walletPassword"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#18d1ce] focus:border-[#18d1ce] transition-all duration-200"
                  placeholder="Enter password (min 6 characters)"
                  value={walletPassword}
                  onChange={(e) => setWalletPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 flex items-center"
                  onClick={() => setShowWalletPassword(!showWalletPassword)}
                >
                  {showWalletPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-0.5">
                Confirm Password
              </label>
              <input
                type={showWalletPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#18d1ce] focus:border-[#18d1ce] transition-all duration-200"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Create/Import Button */}
        <button
          type="submit"
          className="w-full bg-[#18d1ce] text-white py-1.5 px-3 rounded-lg font-medium hover:bg-[#16beb8] focus:outline-none focus:ring-1 focus:ring-[#18d1ce] focus:ring-offset-1 transition-colors duration-200 disabled:bg-[#7ae9e7] disabled:cursor-not-allowed mt-1 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : method === 'create' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Wallet
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Wallet
            </>
          )}
        </button>
      </form>
    </div>
  );
} 