import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletProvider';
import BalanceList from './BalanceList';
import TransactionsList from './TransactionsList';
import SendTokenForm from './SendTokenForm';
import EcosystemGrid from './EcosystemGrid';
import QRCode from 'react-qr-code';
import { ethers } from 'ethers';
import { ERC20_ABI } from '../utils/networks';

export default function Dashboard({ onOpenSettings }) {
  const { currentWallet, network, tokens } = useWallet();
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedTokenForSend, setSelectedTokenForSend] = useState('ETH');
  const [activeTab, setActiveTab] = useState('wallet');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // If no wallet is selected, show message
  if (!currentWallet) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <p>No wallet selected. Please add a wallet.</p>
      </div>
    );
  }
  
  // Function to open explorer
  const openExplorer = () => {
    window.open(`${network.explorer}/address/${currentWallet.address}`, "_blank");
  };
  
  // Function to copy address
  const copyAddress = () => {
    navigator.clipboard.writeText(currentWallet.address);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  // Shorten address for display
  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Function to show send form with a specific token
  const handleSendToken = (tokenSymbol) => {
    setSelectedTokenForSend(tokenSymbol);
    setShowSendForm(true);
  };
  
  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <div className="h-full flex flex-col">
            <h3 className="text-base font-medium mb-2">Balances</h3>
            <div className="flex-grow overflow-y-auto">
              <div className="flex flex-col space-y-2">
                {['ETH', ...tokens.map(t => t.symbol)].map(symbol => (
                  <div key={symbol} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <div className="flex flex-col">
                      <span className="font-medium">{symbol}</span>
                      <BalanceItem address={currentWallet.address} symbol={symbol} />
                    </div>
                    <button 
                      onClick={() => handleSendToken(symbol)}
                      className="bg-[#18d1ce] text-white py-1 px-3 rounded-md hover:bg-[#16beb8] text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Send
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'receive':
        return (
          <div className="h-full flex flex-col">
            <h3 className="text-base font-medium mb-2 self-start">Receive</h3>
            <div className="flex-grow overflow-y-auto flex flex-col items-center justify-center">
              <div className="bg-white p-2 rounded-lg mb-3">
                <QRCode value={currentWallet.address} size={150} />
              </div>
              
              <div className="w-full bg-gray-50 p-3 rounded mb-3">
                <div className="text-sm text-gray-600 mb-1">Your wallet address:</div>
                <div className="font-mono text-sm break-all">{currentWallet.address}</div>
              </div>
              
              <div className="relative w-full">
                <button 
                  onClick={copyAddress}
                  className="w-full bg-[#18d1ce] text-white py-2 px-4 rounded-md hover:bg-[#16beb8] flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  Copy Address
                </button>
                {copySuccess && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded animate-fade-out whitespace-nowrap">
                    Copied!
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'swap':
        return (
          <div className="h-full flex flex-col">
            <h3 className="text-base font-medium mb-1">Swap</h3>
            <div className="flex-grow overflow-y-auto">
              <div className="bg-gray-50 p-3 rounded-md mb-2">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">From:</label>
                  <select className="w-full p-1.5 border rounded text-sm">
                    <option value="ETH">ETH</option>
                    {tokens.map(t => (
                      <option key={`from-${t.address}`} value={t.symbol}>{t.symbol}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    placeholder="Amount" 
                    className="w-full p-1.5 border rounded mt-1 text-sm"
                  />
                </div>
                
                <div className="flex justify-center my-1">
                  <button className="bg-gray-200 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">To:</label>
                  <select className="w-full p-1.5 border rounded text-sm">
                    {tokens.map(t => (
                      <option key={`to-${t.address}`} value={t.symbol}>{t.symbol}</option>
                    ))}
                    <option value="ETH">ETH</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="You will receive (estimated)" 
                    className="w-full p-1.5 border rounded mt-1 text-sm"
                    disabled
                  />
                </div>
                
                <button className="w-full bg-gray-300 text-gray-600 py-1.5 px-4 rounded-md cursor-not-allowed text-sm">
                  Swap (coming soon)
                </button>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                Swap functionality is currently under development
              </div>
            </div>
          </div>
        );
      
      case 'history':
        return (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium">Transaction History</h3>
              <button 
                onClick={openExplorer}
                className="text-[#18d1ce] text-sm hover:text-[#16beb8]"
              >
                View in Explorer
              </button>
            </div>
            <div className="flex-grow overflow-y-auto">
              <TransactionsList address={currentWallet.address} />
            </div>
          </div>
        );
      
      case 'ecosystem':
        return (
          <div className="h-full flex flex-col">
            <h3 className="text-base font-medium mb-2">Ecosystem</h3>
            <div className="flex-grow overflow-y-auto">
              <EcosystemGrid />
            </div>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };
  
  return (
    <div className="min-w-[300px] text-gray-800 flex flex-col h-full">
      {/* Wallet header with new design */}
      <div className="flex flex-col">
        {/* Logo at the top */}
        <div className="flex justify-center items-center bg-[#18d1ce] pt-2 pb-0">
          <img src="/SuperSafe_1line-cropped.svg" alt="SuperSafe" className="h-16" />
        </div>
        
        {/* Wallet information */}
        <div className="flex items-center justify-between p-3 bg-[#18d1ce] text-white">
          <div className="flex items-center flex-1">
            <h2 className="font-bold text-base mr-2">{currentWallet.alias}</h2>
            <span className="text-black text-xs font-medium">{shortenAddress(currentWallet.address)}</span>
            <div className="relative ml-1">
              <button 
                onClick={copyAddress} 
                className="text-gray-600 hover:text-gray-900"
                title="Copy address"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </button>
              {copySuccess && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded animate-fade-out whitespace-nowrap z-10">
                  Copied!
                </div>
              )}
            </div>
          </div>
          
          {/* Gear icon more to the corner */}
          <button 
            onClick={onOpenSettings} 
            className="text-gray-600 hover:text-gray-900 group relative"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            
            {/* Tooltip */}
            <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Settings
            </div>
          </button>
        </div>
      </div>
      
      {/* Network indicator with testnet warning if applicable */}
      <div className="px-4 pt-2 pb-1">
        {network.testnet ? (
          <div className="flex flex-col mb-1">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-0.5 rounded-md mb-1 font-medium text-center text-sm leading-tight">
              ⚠️ TESTNET MODE
            </div>
          </div>
        ) : null }
      </div>
      
      {/* Main content with fixed height and scroll when necessary */}
      <div className="flex-grow overflow-hidden p-4 pb-16 flex">
        <div className="w-full h-full min-h-[380px]">
          {showSendForm ? (
            <SendTokenForm 
              onClose={() => setShowSendForm(false)} 
              initialToken={selectedTokenForSend}
            />
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
      
      {/* Fixed bottom menu */}
      <div className="border-t flex justify-between fixed bottom-0 left-0 right-0 bg-white">
        {['wallet', 'receive', 'swap', 'ecosystem', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              if (!showSendForm) setActiveTab(tab);
            }}
            className={`flex-1 py-3 text-center text-sm relative group ${
              activeTab === tab && !showSendForm 
                ? 'text-[#18d1ce] border-t-2 border-[#18d1ce] font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={showSendForm}
            title={tab.charAt(0).toUpperCase() + tab.slice(1)}
          >
            {/* Icons for each tab */}
            {tab === 'wallet' && (
              <div className="flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6a2 2 0 012-2h14a2 2 0 012 2v1m-16 5v7a2 2 0 002 2h10a2 2 0 002-2v-7m-10 1v7a2 2 0 002 2h-8a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 00-2 2v8z" />
                </svg>
              </div>
            )}
            {tab === 'receive' && (
              <div className="flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
            )}
            {tab === 'swap' && (
              <div className="flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            )}
            {tab === 'ecosystem' && (
              <div className="flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            )}
            {tab === 'history' && (
              <div className="flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            
            {/* Tooltip that shows on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Auxiliary component to show balance of a specific token
function BalanceItem({ address, symbol }) {
  const { tokens, network, securityToggles } = useWallet();
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get balance for the specific token
  useEffect(() => {
    if (!address) return;
    
    const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    let mounted = true;

    async function fetchBalance() {
      try {
        setIsLoading(true);
        setError(null);
        
        let result;
        
        // Get ETH balance
        if (symbol === 'ETH') {
          result = await provider.getBalance(address);
        } else {
          // Get ERC-20 token balance
          const token = tokens.find(t => t.symbol === symbol);
          if (token) {
            const erc20 = new ethers.Contract(token.address, ERC20_ABI, provider);
            result = await erc20.balanceOf(address);
          }
        }
        
        if (result && mounted) {
          // Format balance: convert BigNumber to readable format with decimals
          const decimals = symbol === 'ETH' ? 18 : 
            tokens.find(t => t.symbol === symbol)?.decimals || 18;
          
          const formattedValue = ethers.utils.formatUnits(result, decimals);
          setBalance(parseFloat(formattedValue).toFixed(4)); // Format to 4 decimals
          setIsLoading(false);
        }
      } catch (err) {
        console.error(`Error fetching ${symbol} balance:`, err);
        if (mounted) {
          setError(`Error loading ${symbol} balance`);
          setIsLoading(false);
        }
      }
    }

    fetchBalance();
    
    // Update every 30 seconds
    const timer = setInterval(fetchBalance, 30000);
    
    return () => { 
      mounted = false;
      clearInterval(timer);
    };
  }, [address, symbol, network, tokens]);

  if (error) {
    return <span className="text-sm text-red-500">Error</span>;
  }

  if (isLoading && balance === null) {
    return <span className="text-sm text-gray-500">Loading...</span>;
  }
  
  return (
    <span className="text-sm text-gray-500">
      {securityToggles?.hideBalances ? '******' : (balance !== null ? balance : '0.0000')}
    </span>
  );
} 