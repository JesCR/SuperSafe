import { useState } from 'react';
import { useWallet } from '../contexts/WalletProvider';
import NetworkSwitcher from './NetworkSwitcher';
import AddWalletForm from './AddWalletForm';
import AddTokenForm from './AddTokenForm';

export default function Settings({ onBack }) {
  const { 
    wallets, 
    currentWalletIndex,
    setCurrentWalletIndex,
    removeWallet, 
    currentWallet,
    network,
    tokens,
    removeToken
  } = useWallet();
  
  const [view, setView] = useState('main');
  const [securityToggles, setSecurityToggles] = useState({
    lockOnExit: true,
    confirmTransactions: true,
    hideBalances: false,
    requestPasswordOnOpen: true,
    autoLockAfter5Min: true
  });
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  
  // Shortens an address for display
  const shortenAddress = (address) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };
  
  // Function to copy address to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a visual feedback (toast) here
  };
  
  // Opens a link in a new tab
  const openExternalLink = (url) => {
    window.open(url, '_blank');
  };
  
  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    // In a real app, we would verify the current password and update it
    // For now, we'll just simulate success
    setPasswordError('');
    setShowPasswordChange(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Show success message (in a real app, we would have a proper toast/notification system)
    alert('Password changed successfully');
  };
  
  const renderMainSettings = () => (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      
      <div className="space-y-4">
        {/* Wallets Section */}
        <div className="border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium">My Wallets</h3>
            <button 
              onClick={() => setView('addWallet')} 
              className="text-blue-600 hover:text-blue-800"
            >
              Add Wallet
            </button>
          </div>
          
          <div className="divide-y">
            {wallets.map((wallet, index) => (
              <div key={wallet.address} className="p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{wallet.alias}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <span className="font-mono">{shortenAddress(wallet.address)}</span>
                    <button 
                      onClick={() => copyToClipboard(wallet.address)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      title="Copy address"
                    >
                      📋
                    </button>
                    <button 
                      onClick={() => openExternalLink(`${network.explorer}/address/${wallet.address}`)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      title="View in explorer"
                    >
                      🔍
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {currentWalletIndex === index ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded w-16 text-center">
                      ACTIVE
                    </span>
                  ) : (
                    <button 
                      onClick={() => setCurrentWalletIndex(index)} 
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 w-16 text-center"
                    >
                      Select
                    </button>
                  )}
                  <button 
                    onClick={() => removeWallet(index)} 
                    className="text-red-600 hover:text-red-800"
                    title="Remove wallet"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Network Section */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium">Network</h3>
          </div>
          <div className="p-3">
            <NetworkSwitcher />
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Explorer:</div>
              <div>
                <a 
                  href={network.explorer} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {network.explorer}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tokens Section */}
        <div className="border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium">Custom Tokens</h3>
            <button 
              onClick={() => setView('addToken')} 
              className="text-blue-600 hover:text-blue-800"
            >
              Add Token
            </button>
          </div>
          
          <div className="divide-y">
            {tokens.length === 0 ? (
              <div className="p-3 text-gray-500 text-center">
                No custom tokens added
              </div>
            ) : (
              tokens.map(token => (
                <div key={token.address} className="p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{token.symbol} - {token.name || 'Custom Token'}</div>
                    <div className="text-sm text-gray-600 flex items-center flex-wrap">
                      <span className="font-mono mr-2">{shortenAddress(token.address)}</span>
                      <div className="flex items-center">
                        <button 
                          onClick={() => copyToClipboard(token.address)}
                          className="mr-2 text-blue-600 hover:text-blue-800"
                          title="Copy address"
                        >
                          📋
                        </button>
                        <button 
                          onClick={() => openExternalLink(`${network.explorer}/token/${token.address}`)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View in explorer"
                        >
                          🔍
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeToken(token.address)} 
                    className="text-red-600 hover:text-red-800"
                    title="Remove token"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Security Section */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium">Security</h3>
          </div>
          <div className="p-3 space-y-3">
            {Object.entries(securityToggles).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span>
                  {key === 'lockOnExit' && 'Lock on exit'}
                  {key === 'confirmTransactions' && 'Confirm all transactions'}
                  {key === 'hideBalances' && 'Hide balances'}
                  {key === 'requestPasswordOnOpen' && 'Request password on open'}
                  {key === 'autoLockAfter5Min' && 'Auto-lock after 5 minutes'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={value}
                    onChange={() => {
                      setSecurityToggles({
                        ...securityToggles,
                        [key]: !value
                      });
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
            
            {!showPasswordChange ? (
              <button 
                className="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                onClick={() => setShowPasswordChange(true)}
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="mt-3 space-y-3">
                {passwordError && (
                  <div className="text-red-600 text-sm">{passwordError}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input 
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input 
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input 
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setPasswordError('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* About Section */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium">About</h3>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600">SuperSafe Wallet v1.0.0</p>
            <p className="text-sm text-gray-600">A minimalist wallet for SuperSeed and EVM networks</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  const handleBackToMain = () => {
    setView('main');
  };
  
  return (
    <div className="min-w-[300px] h-full flex flex-col">
      {/* Header with back button */}
      {view !== 'main' && (
        <div className="flex items-center p-4 border-b">
          <button 
            onClick={handleBackToMain} 
            className="text-blue-600 hover:text-blue-800 mr-3"
          >
            ← Back
          </button>
          <h2 className="text-lg font-semibold">
            {view === 'addWallet' && 'Add Wallet'}
            {view === 'addToken' && 'Add Token'}
          </h2>
        </div>
      )}
      
      {view === 'main' && (
        <div className="flex-grow overflow-auto">
          {renderMainSettings()}
        </div>
      )}
      
      {view === 'addWallet' && (
        <div className="flex-grow overflow-auto p-4">
          <AddWalletForm onComplete={handleBackToMain} />
        </div>
      )}
      
      {view === 'addToken' && (
        <div className="flex-grow overflow-auto p-4">
          <AddTokenForm onComplete={handleBackToMain} />
        </div>
      )}
      
      {/* Footer */}
      <div className="border-t p-3 text-center">
        <button 
          onClick={onBack} 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Back to Wallet
        </button>
      </div>
    </div>
  );
} 