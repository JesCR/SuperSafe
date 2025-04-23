import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletProvider';
import { ERC20_ABI } from '../utils/networks';

export default function BalanceList({ address }) {
  const { network, tokens, securityToggles } = useWallet();
  const [balances, setBalances] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!address) return;
    
    const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    let mounted = true;

    async function fetchBalances() {
      try {
        setIsLoading(true);
        setError(null);
        
        const balancePromises = {};
        
        // Get ETH balance
        balancePromises['ETH'] = provider.getBalance(address);
        
        // Get ERC-20 token balances in parallel
        for (const token of tokens) {
          const erc20 = new ethers.Contract(token.address, ERC20_ABI, provider);
          balancePromises[token.symbol] = erc20.balanceOf(address);
        }
        
        // Wait for all promises
        const results = await Promise.allSettled(
          Object.entries(balancePromises).map(async ([symbol, promise]) => {
            try {
              const result = await promise;
              return { symbol, result };
            } catch (err) {
              console.error(`Error fetching balance for ${symbol}:`, err);
              return { symbol, error: err };
            }
          })
        );
        
        // Process results
        const balancesMap = {};
        results.forEach(({ status, value }) => {
          if (status === 'fulfilled' && value.result) {
            // Format balances: convert BigNumber to readable format with decimals
            const symbol = value.symbol;
            const decimals = symbol === 'ETH' ? 18 : 
              tokens.find(t => t.symbol === symbol)?.decimals || 18;
            
            const formattedValue = ethers.utils.formatUnits(value.result, decimals);
            balancesMap[symbol] = parseFloat(formattedValue).toFixed(4); // Format to 4 decimals
          }
        });
        
        if (mounted) {
          setBalances(balancesMap);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching balances:', err);
        if (mounted) {
          setError('Error loading balances. Please try again.');
          setIsLoading(false);
        }
      }
    }

    fetchBalances();
    
    // Optionally set up a timer to update periodically
    const timer = setInterval(fetchBalances, 30000); // Update every 30s
    
    return () => { 
      mounted = false; 
      clearInterval(timer); 
    };
  }, [address, network, tokens]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg">
        {error}
      </div>
    );
  }

  if (isLoading && Object.keys(balances).length === 0) {
    return (
      <div className="flex flex-col space-y-3">
        {['ETH', ...tokens.map(t => t.symbol)].map(symbol => (
          <div key={symbol} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {symbol === 'ETH' ? '⧫' : symbol.charAt(0)}
              </div>
              <span className="font-medium">{symbol}</span>
            </div>
            <div className="w-20 h-6 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  // Show each token balance
  return (
    <div className="flex flex-col space-y-3">
      {['ETH', ...tokens.map(t => t.symbol)].map(symbol => (
        <div key={symbol} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#18d1ce]/20 text-[#18d1ce] flex items-center justify-center overflow-hidden font-medium">
              {symbol === 'ETH' ? '⧫' : symbol.charAt(0)}
            </div>
            <div>
              <span className="font-medium">{symbol}</span>
              {symbol !== 'ETH' && tokens.find(t => t.symbol === symbol) && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {shortenAddress(tokens.find(t => t.symbol === symbol).address)}
                </div>
              )}
            </div>
          </div>
          <span className="font-medium text-gray-900">
            {securityToggles?.hideBalances 
              ? '******' 
              : (balances[symbol] !== undefined ? balances[symbol] : '...')}
          </span>
        </div>
      ))}
    </div>
  );
}

// Helper function to shorten address
function shortenAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
} 