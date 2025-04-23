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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-[#18d1ce] focus:border-[#18d1ce]"
            placeholder="0x..."
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            disabled={loading || tokenInfo}
          />
          <button
            type="button"
            onClick={tokenInfo ? resetForm : handleLookupToken}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-r-md hover:bg-gray-300 disabled:bg-gray-100 flex items-center"
          >
            {tokenInfo ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </>
            ) : loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Lookup
              </>
            )}
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
            className="mt-4 w-full bg-[#18d1ce] text-white py-2 px-4 rounded-md hover:bg-[#16beb8] disabled:bg-[#7ae9e7] flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Token
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
} 