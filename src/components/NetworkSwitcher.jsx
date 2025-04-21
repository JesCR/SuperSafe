import { useState } from 'react';
import { useWallet } from '../contexts/WalletProvider';
import { NETWORKS } from '../utils/networks';

export default function NetworkSwitcher() {
  const { networkKey, switchNetwork } = useWallet();
  const [isChanging, setIsChanging] = useState(false);
  
  const handleNetworkChange = (event) => {
    const newNetwork = event.target.value;
    setIsChanging(true);
    
    // In a real app, we might have a confirmation here especially when switching between mainnet/testnet
    setTimeout(() => {
      switchNetwork(newNetwork);
      setIsChanging(false);
    }, 500); // Simulate a slight delay
  };
  
  return (
    <div>
      <label htmlFor="network-select" className="block text-sm font-medium text-gray-700 mb-1">
        Network
      </label>
      
      <div className="relative">
        <select
          id="network-select"
          value={networkKey}
          onChange={handleNetworkChange}
          disabled={isChanging}
          className="appearance-none w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          {Object.entries(NETWORKS).map(([key, network]) => (
            <option key={key} value={key}>
              {network.name} {network.testnet ? '(Testnet)' : ''}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {isChanging && (
        <div className="mt-2 text-sm text-gray-500">
          Switching network...
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        {NETWORKS[networkKey].testnet ? (
          <div className="text-yellow-600 font-medium">
            Warning: You are on a testnet. Funds on this network have no real value.
          </div>
        ) : null}
      </div>
    </div>
  );
} 