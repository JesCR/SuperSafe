import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletProvider';
import { ERC20_ABI } from '../utils/networks';

export default function AddTokenForm({ onComplete }) {
  const { addToken, getProvider, networkKey } = useWallet();
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);

  const resetForm = () => {
    setTokenAddress('');
    setTokenInfo(null);
    setError('');
  };

  const handleLookupToken = async () => {
    if (!ethers.utils.isAddress(tokenAddress)) {
      setError('Please enter a valid token address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Get provider for current network
      const provider = getProvider();
      
      // Create contract instance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        provider
      );

      // Get token information
      const [name, symbol, decimals] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals()
      ]);

      setTokenInfo({ name, symbol, decimals: decimals.toString() });
    } catch (err) {
      console.error('Error fetching token information:', err);
      setError('This address does not appear to be a valid ERC-20 token');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = async () => {
    if (!tokenInfo) return;
    
    setLoading(true);
    
    try {
      // Call addToken function from context
      await addToken(
        tokenInfo.symbol,
        tokenAddress,
        tokenInfo.decimals,
        networkKey
      );
      
      // Success
      resetForm();
      onComplete();
    } catch (err) {
      console.error('Error adding token:', err);
      setError(err.message || 'Error adding token');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-700 mb-1">
          Token Contract Address
        </label>
        <div className="flex">
          <input
            type="text"
            id="tokenAddress"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="0x..."
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            disabled={loading || tokenInfo}
          />
          <button
            type="button"
            onClick={tokenInfo ? resetForm : handleLookupToken}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-r-md hover:bg-gray-300 disabled:bg-gray-100"
          >
            {tokenInfo ? 'Clear' : loading ? 'Loading...' : 'Lookup'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {tokenInfo && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">Token Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">Name:</div>
            <div>{tokenInfo.name}</div>
            
            <div className="text-gray-600">Symbol:</div>
            <div>{tokenInfo.symbol}</div>
            
            <div className="text-gray-600">Decimals:</div>
            <div>{tokenInfo.decimals}</div>
          </div>
          
          <button
            type="button"
            onClick={handleAddToken}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Adding...' : 'Add Token'}
          </button>
        </div>
      )}
    </div>
  );
} 