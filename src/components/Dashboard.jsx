import { useState } from 'react';
import { useWallet } from '../contexts/WalletProvider';
import BalanceList from './BalanceList';
import TransactionsList from './TransactionsList';
import SendTokenForm from './SendTokenForm';
import QRCode from 'react-qr-code';

export default function Dashboard({ onOpenSettings }) {
  const { currentWallet, network, tokens } = useWallet();
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedTokenForSend, setSelectedTokenForSend] = useState('ETH');
  const [activeTab, setActiveTab] = useState('wallet');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Si no hay billetera seleccionada, mostrar mensaje
  if (!currentWallet) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <p>No wallet selected. Please add a wallet.</p>
      </div>
    );
  }
  
  // Función para abrir el explorador
  const openExplorer = () => {
    window.open(`${network.explorer}/address/${currentWallet.address}`, "_blank");
  };
  
  // Función para copiar la dirección
  const copyAddress = () => {
    navigator.clipboard.writeText(currentWallet.address);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  // Acortar la dirección para mostrar
  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Función para mostrar el formulario de envío con un token específico
  const handleSendToken = (tokenSymbol) => {
    setSelectedTokenForSend(tokenSymbol);
    setShowSendForm(true);
  };
  
  // Renderizar contenido según la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <div>
            <h3 className="text-base font-medium mb-2">Balances</h3>
            <div className="flex flex-col space-y-2">
              {['ETH', ...tokens.map(t => t.symbol)].map(symbol => (
                <div key={symbol} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <div className="flex flex-col">
                    <span className="font-medium">{symbol}</span>
                    <BalanceItem address={currentWallet.address} symbol={symbol} />
                  </div>
                  <button 
                    onClick={() => handleSendToken(symbol)}
                    className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Send
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'receive':
        return (
          <div className="flex flex-col items-center p-2">
            <h3 className="text-base font-medium mb-3 self-start">Receive</h3>
            
            <div className="bg-white p-3 rounded-lg mb-4">
              <QRCode value={currentWallet.address} size={180} />
            </div>
            
            <div className="w-full bg-gray-50 p-3 rounded mb-3">
              <div className="text-sm text-gray-600 mb-1">Your wallet address:</div>
              <div className="font-mono text-sm break-all">{currentWallet.address}</div>
            </div>
            
            <button 
              onClick={copyAddress}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              {copySuccess ? 'Copied!' : 'Copy Address'}
            </button>
          </div>
        );
      
      case 'swap':
        return (
          <div className="p-2">
            <h3 className="text-base font-medium mb-3">Swap</h3>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">From:</label>
                <select className="w-full p-2 border rounded">
                  <option value="ETH">ETH</option>
                  {tokens.map(t => (
                    <option key={`from-${t.address}`} value={t.symbol}>{t.symbol}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  placeholder="Amount" 
                  className="w-full p-2 border rounded mt-2"
                />
              </div>
              
              <div className="flex justify-center my-2">
                <button className="bg-gray-200 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">To:</label>
                <select className="w-full p-2 border rounded">
                  {tokens.map(t => (
                    <option key={`to-${t.address}`} value={t.symbol}>{t.symbol}</option>
                  ))}
                  <option value="ETH">ETH</option>
                </select>
                <input 
                  type="number" 
                  placeholder="You will receive (estimated)" 
                  className="w-full p-2 border rounded mt-2"
                  disabled
                />
              </div>
              
              <button className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-md cursor-not-allowed">
                Swap (coming soon)
              </button>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Swap functionality is currently under development
            </div>
          </div>
        );
      
      case 'history':
        return (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-medium">Transaction History</h3>
              <button 
                onClick={openExplorer}
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                View in Explorer
              </button>
            </div>
            <TransactionsList address={currentWallet.address} />
          </div>
        );
      
      default:
        return <div>Select a tab</div>;
    }
  };
  
  return (
    <div className="min-w-[300px] text-gray-800 flex flex-col h-full">
      {/* Cabecera de la billetera */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">{currentWallet.alias}</h2>
          <div className="flex items-center text-sm">
            <span className="text-gray-600">{shortenAddress(currentWallet.address)}</span>
            <button 
              onClick={copyAddress} 
              className="ml-2 text-blue-600 hover:text-blue-800"
              title="Copy address"
            >
              📋
            </button>
          </div>
        </div>
        {/* Ícono de engranaje para abrir Configuración */}
        <button 
          onClick={onOpenSettings} 
          className="p-2 hover:bg-gray-100 rounded-full text-2xl"
          title="Settings"
        >
          ⚙️
        </button>
      </div>
      
      {/* Network indicator with testnet warning if applicable */}
      <div className="px-4 pt-2">
        {network.testnet ? (
          <div className="flex flex-col mb-4">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-md mb-2 font-medium text-center text-sm">
              ⚠️ TESTNET MODE
            </div>
            <div className="flex items-center bg-gray-100 py-1 px-3 rounded-md">
              <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
              <span className="text-sm">{network.name}</span>
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-gray-100 py-1 px-3 rounded-md inline-flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span className="text-sm">{network.name}</span>
          </div>
        )}
      </div>
      
      {/* Contenido principal */}
      <div className="flex-grow overflow-auto p-4">
        {showSendForm ? (
          <SendTokenForm 
            onClose={() => setShowSendForm(false)} 
            initialToken={selectedTokenForSend}
          />
        ) : (
          renderTabContent()
        )}
      </div>
      
      {/* Menú inferior */}
      <div className="border-t flex justify-between">
        {['wallet', 'receive', 'swap', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              if (!showSendForm) setActiveTab(tab);
            }}
            className={`flex-1 py-3 text-center text-sm ${
              activeTab === tab && !showSendForm 
                ? 'text-blue-600 border-t-2 border-blue-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={showSendForm}
          >
            {tab === 'wallet' && 'Wallet'}
            {tab === 'receive' && 'Receive'}
            {tab === 'swap' && 'Swap'}
            {tab === 'history' && 'History'}
          </button>
        ))}
      </div>
    </div>
  );
}

// Componente auxiliar para mostrar el saldo de un token específico
function BalanceItem({ address, symbol }) {
  const { tokens } = useWallet();
  const [balance, setBalance] = useState(null);
  
  // Aquí se obtendría el saldo del token para mostrarlo
  // Por simplicidad, este componente solo renderiza el símbolo
  // El saldo real se mostraría con una lógica similar a BalanceList.jsx
  
  return (
    <span className="text-sm text-gray-500">
      {balance !== null ? balance : '...'}
    </span>
  );
} 