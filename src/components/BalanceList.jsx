import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletProvider';
import { ERC20_ABI } from '../utils/networks';

export default function BalanceList({ address }) {
  const { network, tokens } = useWallet();
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
        
        // Obtener saldo de ETH
        balancePromises['ETH'] = provider.getBalance(address);
        
        // Obtener saldos de tokens ERC-20 en paralelo
        for (const token of tokens) {
          const erc20 = new ethers.Contract(token.address, ERC20_ABI, provider);
          balancePromises[token.symbol] = erc20.balanceOf(address);
        }
        
        // Esperar todas las promesas
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
        
        // Procesar resultados
        const balancesMap = {};
        results.forEach(({ status, value }) => {
          if (status === 'fulfilled' && value.result) {
            // Formatear saldos: convertir BigNumber a formato legible con decimales
            const symbol = value.symbol;
            const decimals = symbol === 'ETH' ? 18 : 
              tokens.find(t => t.symbol === symbol)?.decimals || 18;
            
            const formattedValue = ethers.utils.formatUnits(value.result, decimals);
            balancesMap[symbol] = parseFloat(formattedValue).toFixed(4); // Formatear a 4 decimales
          }
        });
        
        if (mounted) {
          setBalances(balancesMap);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching balances:', err);
        if (mounted) {
          setError('Error al cargar los saldos. Por favor, inténtelo de nuevo.');
          setIsLoading(false);
        }
      }
    }

    fetchBalances();
    
    // Opcionalmente, configurar un temporizador para actualizar periódicamente
    const timer = setInterval(fetchBalances, 30000); // Actualizar cada 30s
    
    return () => { 
      mounted = false; 
      clearInterval(timer); 
    };
  }, [address, network, tokens]);

  if (error) {
    return <div className="text-red-500 text-sm p-2">{error}</div>;
  }

  if (isLoading && Object.keys(balances).length === 0) {
    return (
      <div className="flex flex-col space-y-2">
        {['ETH', ...tokens.map(t => t.symbol)].map(symbol => (
          <div key={symbol} className="flex justify-between items-center bg-gray-50 p-3 rounded">
            <span>{symbol}</span>
            <div className="w-16 h-5 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Mostrar cada saldo de token
  return (
    <div className="flex flex-col space-y-2">
      {['ETH', ...tokens.map(t => t.symbol)].map(symbol => (
        <div key={symbol} className="flex justify-between items-center bg-gray-50 p-3 rounded">
          <span>{symbol}</span>
          <span className="font-medium">
            {balances[symbol] !== undefined ? balances[symbol] : '...'}
          </span>
        </div>
      ))}
    </div>
  );
} 