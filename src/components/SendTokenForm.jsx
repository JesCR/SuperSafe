import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletProvider';

export default function SendTokenForm({ onClose, initialToken = 'ETH' }) {
  const { currentWallet, tokens, network, sendETH, sendToken } = useWallet();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState(initialToken);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Update tokenSymbol if initialToken changes (needed for proper initialization)
  useEffect(() => {
    setTokenSymbol(initialToken);
  }, [initialToken]);
  
  // Obtain the selected token from state
  const selectedToken = tokenSymbol === 'ETH' 
    ? null 
    : tokens.find(t => t.symbol === tokenSymbol);
  
  // Handle sending
  const handleSend = async (e) => {
    e.preventDefault();
    
    // Validate recipient address
    if (!ethers.utils.isAddress(toAddress)) {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    
    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: 'error', message: 'Invalid amount' });
      return;
    }
    
    setIsLoading(true);
    setStatus({ type: 'info', message: 'Sending...' });
    
    try {
      let tx;
      
      if (tokenSymbol === 'ETH') {
        // Send ETH
        tx = await sendETH(toAddress, amount);
      } else {
        // Send ERC-20 token
        tx = await sendToken(
          selectedToken.address, 
          toAddress, 
          amount,
          selectedToken.decimals
        );
      }
      
      setStatus({ 
        type: 'success', 
        message: 'Transaction successful!',
        txHash: tx.hash
      });
      
      // Clear form after sending
      setAmount('');
      setToAddress('');
    } catch (error) {
      console.error('Transfer error:', error);
      setStatus({ 
        type: 'error', 
        message: error.message || 'Transfer failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to view transaction in explorer
  const viewTransaction = (txHash) => {
    window.open(`${network.explorer}/tx/${txHash}`, '_blank');
  };
  
  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Send {tokenSymbol}</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={handleSend}>
        {/* Token selector */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Token:</label>
          <select 
            value={tokenSymbol} 
            onChange={e => setTokenSymbol(e.target.value)} 
            className="w-full p-2 border rounded focus:ring-[#18d1ce] focus:border-[#18d1ce]"
            disabled={isLoading}
          >
            <option value="ETH">ETH</option>
            {tokens.map(t => (
              <option key={t.address} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
        </div>
        
        {/* Recipient address */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Recipient Address:</label>
          <input 
            type="text" 
            value={toAddress} 
            onChange={e => setToAddress(e.target.value)} 
            placeholder="0x..." 
            className="w-full p-2 border rounded focus:ring-[#18d1ce] focus:border-[#18d1ce]"
            disabled={isLoading}
          />
        </div>
        
        {/* Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Amount:</label>
          <div className="relative">
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="0.0" 
              step="0.0001"
              min="0"
              className="w-full p-2 border rounded focus:ring-[#18d1ce] focus:border-[#18d1ce]"
              disabled={isLoading}
            />
            <span className="absolute right-3 top-2 text-gray-500">
              {tokenSymbol}
            </span>
          </div>
        </div>
        
        {/* Status message */}
        {status && (
          <div className={`mb-3 p-2 rounded text-sm ${
            status.type === 'error' ? 'bg-red-100 text-red-700' : 
            status.type === 'success' ? 'bg-green-100 text-green-700' : 
            'bg-[#18d1ce]/10 text-[#16beb8]'
          }`}>
            <div className="flex justify-between items-center">
              <span>{status.message}</span>
              {status.txHash && (
                <button 
                  onClick={() => viewTransaction(status.txHash)}
                  className="text-[#18d1ce] hover:text-[#16beb8] underline text-xs"
                >
                  View
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex space-x-2">
          <button 
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded font-medium flex items-center justify-center ${
              isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#18d1ce] text-white hover:bg-[#16beb8]'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Send
              </>
            )}
          </button>
          <button 
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 