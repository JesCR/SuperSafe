import { useState } from 'react';
import { useWallet } from '../contexts/WalletProvider';
import { ethers } from 'ethers';

export default function AddWalletForm({ onComplete }) {
  const { addWallet } = useWallet();
  const [method, setMethod] = useState('create'); // 'create' or 'import'
  const [alias, setAlias] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCreateWallet = async () => {
    if (!alias) {
      setError('Please enter a name for your wallet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create new random wallet
      const wallet = ethers.Wallet.createRandom();
      
      // Add wallet to state
      await addWallet({
        address: wallet.address,
        privateKey: wallet.privateKey,
        alias: alias
      });
      
      // Success
      onComplete();
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('Failed to create wallet');
    } finally {
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
      
      // Add wallet to state
      await addWallet({
        address: wallet.address,
        privateKey: formattedKey,
        alias: alias
      });
      
      // Success
      onComplete();
    } catch (err) {
      console.error('Error importing wallet:', err);
      setError('Invalid private key');
    } finally {
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

  return (
    <div className="space-y-4">
      {/* Method Selection */}
      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md ${
            method === 'create'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          onClick={() => setMethod('create')}
        >
          Create New
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md ${
            method === 'import'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          onClick={() => setMethod('import')}
        >
          Import Existing
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Wallet Name */}
        <div>
          <label htmlFor="alias" className="block text-sm font-medium text-gray-700 mb-1">
            Wallet Name
          </label>
          <input
            type="text"
            id="alias"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="My Wallet"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
        </div>

        {/* Private Key Input (only for import) */}
        {method === 'import' && (
          <div>
            <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700 mb-1">
              Private Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="privateKey"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your private key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Enter your hexadecimal private key (with or without 0x)
              <br/>
              (Private keys are never sent to any server and are securely stored in your browser)
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {/* Create/Import Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Processing...' : method === 'create' ? 'Create Wallet' : 'Import Wallet'}
        </button>
      </form>
    </div>
  );
} 