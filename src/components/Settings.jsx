import { useState, useEffect } from 'react';
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
    removeToken,
    setPassword,
    securityToggles,
    setSecurityToggles
  } = useWallet();
  
  const [view, setView] = useState('main');
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [copyState, setCopyState] = useState({
    copied: false,
    address: ''
  });
  
  // Shortens an address for display
  const shortenAddress = (address) => {
    return `0x${address.substring(2, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Function to copy address to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyState({ copied: true, address: text });
    setTimeout(() => {
      setCopyState({ copied: false, address: '' });
    }, 1500);
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
    
    // Use the WalletProvider function to change the password
    setPassword(passwordForm.newPassword, passwordForm.currentPassword)
      .then(success => {
        if (success) {
          // Reset form and hide
          setPasswordError('');
          setShowPasswordChange(false);
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          
          // Show success message
          alert('Password changed successfully');
        } else {
          setPasswordError('Error changing password. Please try again.');
        }
      })
      .catch(error => {
        setPasswordError(error.message || 'Error changing password');
      });
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
              className="text-[#18d1ce] hover:text-[#16beb8] flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Wallet
            </button>
          </div>
          
          <div className="divide-y">
            {wallets.map((wallet, index) => (
              <div key={wallet.address} className="p-3 flex items-center">
                {/* Selector de wallet */}
                <div className="mr-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={currentWalletIndex === index}
                      onChange={() => setCurrentWalletIndex(index)}
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#18d1ce] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18d1ce]"></div>
                  </label>
                </div>
                
                <div className="flex-1">
                  <div className="text-sm font-bold">{wallet.alias}</div>
                  <div className="text-xs text-gray-600 font-mono">{shortenAddress(wallet.address)}</div>
                </div>
                
                {/* Agrupamos los iconos a la derecha */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <button 
                      onClick={() => copyToClipboard(wallet.address)}
                      className="text-gray-600 hover:text-gray-800 flex"
                      title="Copy address"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    </button>
                    {copyState.copied && copyState.address === wallet.address && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded animate-fade-out whitespace-nowrap z-10">
                        Copied!
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => openExternalLink(`${network.explorer}/address/${wallet.address}`)}
                    className="text-gray-600 hover:text-gray-800 flex"
                    title="View in explorer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => removeWallet(index)} 
                    className="text-gray-600 hover:text-red-600 flex"
                    title="Remove wallet"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
            
            <div className="mt-3 space-y-1 text-sm">
              <div className="text-gray-600">Explorer:</div>
              <div>
                <a 
                  href={network.explorer} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#18d1ce] hover:text-[#16beb8] hover:underline break-all"
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
              className="text-[#18d1ce] hover:text-[#16beb8] flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
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
                <div key={token.address} className="p-3 flex items-center">
                  <div className="flex-1">
                    <div className="text-sm font-bold">{token.symbol} - {token.name || 'Custom Token'}</div>
                    <div className="text-xs text-gray-600 font-mono">{shortenAddress(token.address)}</div>
                  </div>
                  
                  {/* Agrupamos los iconos a la derecha */}
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button 
                        onClick={() => copyToClipboard(token.address)}
                        className="text-gray-600 hover:text-gray-800 flex"
                        title="Copy address"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                      </button>
                      {copyState.copied && copyState.address === token.address && (
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded animate-fade-out whitespace-nowrap z-10">
                          Copied!
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => openExternalLink(`${network.explorer}/token/${token.address}`)}
                      className="text-gray-600 hover:text-gray-800 flex"
                      title="View in explorer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => removeToken(token.address)} 
                      className="text-gray-600 hover:text-red-600 flex"
                      title="Remove token"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
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
              <div key={key} className="flex items-center">
                <div className="mr-4">
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
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#18d1ce] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18d1ce]"></div>
                  </label>
                </div>
                <span className="flex-1">
                  {key === 'lockOnExit' && 'Lock on exit'}
                  {key === 'confirmTransactions' && 'Confirm all transactions'}
                  {key === 'hideBalances' && 'Hide balances'}
                  {key === 'requestPasswordOnOpen' && 'Request password on open'}
                  {key === 'autoLockAfter5Min' && 'Auto-lock after 5 minutes'}
                </span>
              </div>
            ))}
            
            {!showPasswordChange ? (
              <button 
                className="w-full mt-2 bg-[#18d1ce] text-white py-2 px-4 rounded-md hover:bg-[#16beb8] flex items-center justify-center"
                onClick={() => setShowPasswordChange(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
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
                    className="flex-1 bg-[#18d1ce] text-white py-2 px-4 rounded-md hover:bg-[#16beb8] flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Password
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 flex items-center justify-center"
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
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
            <p className="text-sm text-gray-600">SuperSafe Wallet v1.0.0b</p>
            <p className="text-sm text-gray-600">A minimalist wallet for SuperSeed Networks</p>
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
            className="text-[#18d1ce] hover:text-[#16beb8] mr-3 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="text-lg font-semibold">
            {view === 'addWallet' && 'Add Wallet'}
            {view === 'addToken' && 'Add Token'}
          </h2>
        </div>
      )}
      
      {/* Content area with scroll */}
      <div className="flex-grow overflow-auto pb-16">
        {view === 'main' && renderMainSettings()}
        
        {view === 'addWallet' && (
          <div className="p-4">
            <AddWalletForm onComplete={handleBackToMain} />
          </div>
        )}
        
        {view === 'addToken' && (
          <div className="p-4">
            <AddTokenForm onComplete={handleBackToMain} />
          </div>
        )}
      </div>
      
      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 py-2 px-4 bg-white border-t">
        <button 
          onClick={onBack} 
          className="w-full bg-[#18d1ce] hover:bg-[#16beb8] text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Back to Wallet
        </button>
      </div>
    </div>
  );
} 