import { useState, useEffect } from 'react';
import { useWallet } from './contexts/WalletProvider';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import AddWalletForm from './components/AddWalletForm';

export default function App() {
  const { wallets, isLoading } = useWallet();
  const [showSettings, setShowSettings] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  
  // Show add wallet form if there are no wallets
  useEffect(() => {
    if (!isLoading && wallets.length === 0) {
      setShowAddWallet(true);
    }
  }, [isLoading, wallets]);
  
  // Function to toggle settings panel
  const toggleSettings = () => {
    setShowSettings(prev => !prev);
  };
  
  // Function to close settings and return to main panel
  const handleCloseSettings = () => {
    setShowSettings(false);
  };
  
  // Loading screen during initialization
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#fbf8f3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18d1ce] mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If there are no wallets, show add wallet form
  if (showAddWallet) {
    return (
      <div className="bg-[#fbf8f3] min-h-screen">
        <AddWalletForm onComplete={() => setShowAddWallet(false)} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#fbf8f3]">
      {showSettings ? (
        <Settings onBack={handleCloseSettings} />
      ) : (
        <Dashboard onOpenSettings={toggleSettings} />
      )}
    </div>
  );
} 