import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletProvider';

export default function TransactionsList({ address }) {
  const { network } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;
    
    let mounted = true;
    const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    
    async function fetchTransactions() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular la obtención de transacciones
        // En un caso real, esto podría ser una llamada a la API del explorador
        // o usar ethers.providers.getHistory si lo soporta
        
        // Para esta demo, simulamos algunas transacciones
        // En producción, se usaría una API real del explorador
        const mockTransactions = await simulateTransactionFetch(provider, address);
        
        if (mounted) {
          setTransactions(mockTransactions);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error al cargar transacciones:', err);
        if (mounted) {
          setError('Error al cargar las transacciones. Por favor, inténtelo de nuevo.');
          setIsLoading(false);
        }
      }
    }
    
    fetchTransactions();
    
    return () => {
      mounted = false;
    };
  }, [address, network]);
  
  // Función para simular obtención de transacciones
  // En producción, esto se reemplazaría con llamadas API reales
  async function simulateTransactionFetch(provider, walletAddress) {
    // Esperar un tiempo para simular carga
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generar algunas transacciones ficticias para demostración
    const currentBlock = await provider.getBlockNumber();
    const mockTxs = [];
    
    // 5 transacciones enviadas, 5 recibidas
    for (let i = 0; i < 5; i++) {
      // Transacción enviada
      mockTxs.push({
        hash: '0x' + Math.random().toString(16).substring(2, 42),
        from: walletAddress,
        to: '0x' + Math.random().toString(16).substring(2, 42),
        value: ethers.utils.parseEther((Math.random() * 0.1).toFixed(4)),
        timestamp: Date.now() - i * 86400000, // Días anteriores
        blockNumber: currentBlock - i * 10
      });
      
      // Transacción recibida
      mockTxs.push({
        hash: '0x' + Math.random().toString(16).substring(2, 42),
        from: '0x' + Math.random().toString(16).substring(2, 42),
        to: walletAddress,
        value: ethers.utils.parseEther((Math.random() * 0.1).toFixed(4)),
        timestamp: Date.now() - (i + 0.5) * 86400000, // Días anteriores (intercalados)
        blockNumber: currentBlock - i * 10 - 5
      });
    }
    
    // Ordenar por timestamp (más reciente primero)
    return mockTxs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }
  
  // Formatear fecha relativa
  function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} años atrás`;
    if (interval === 1) return '1 año atrás';
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} meses atrás`;
    if (interval === 1) return '1 mes atrás';
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} días atrás`;
    if (interval === 1) return 'ayer';
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} horas atrás`;
    if (interval === 1) return '1 hora atrás';
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutos atrás`;
    if (interval === 1) return '1 minuto atrás';
    
    return 'hace unos segundos';
  }
  
  // Acortar la dirección
  function shortenAddress(addr) {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  }

  if (error) {
    return <div className="text-red-500 text-sm p-2">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between items-center py-2 px-1 border-b border-gray-100">
            <div className="w-20 h-5 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-16 h-5 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return <p className="text-sm text-gray-500 p-2">No se encontraron transacciones recientes.</p>;
  }

  return (
    <div className="flex flex-col">
      {transactions.map(tx => (
        <div key={tx.hash} className="flex justify-between items-center py-2 px-1 border-b border-gray-100">
          <div>
            <div className="flex items-center">
              {tx.from.toLowerCase() === address.toLowerCase() ? (
                <span className="text-red-500 font-medium">Enviado</span>
              ) : (
                <span className="text-green-500 font-medium">Recibido</span>
              )}
              <span className="ml-2 text-sm text-gray-500">
                {formatTimeAgo(tx.timestamp)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {tx.from.toLowerCase() === address.toLowerCase() 
                ? `A: ${shortenAddress(tx.to)}`
                : `De: ${shortenAddress(tx.from)}`
              }
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">
              {ethers.utils.formatEther(tx.value)} ETH
            </div>
            <a 
              href={`${network.explorer}/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Ver
            </a>
          </div>
        </div>
      ))}
    </div>
  );
} 