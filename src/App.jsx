import { useState, useEffect } from 'react';
import { useWallet } from './contexts/WalletProvider';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import AddWalletForm from './components/AddWalletForm';

export default function App() {
  const { wallets, isLoading } = useWallet();
  const [showSettings, setShowSettings] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  
  // Mostrar formulario de agregar billetera si no hay billeteras
  useEffect(() => {
    if (!isLoading && wallets.length === 0) {
      setShowAddWallet(true);
    }
  }, [isLoading, wallets]);
  
  // Función para alternar panel de configuraciones
  const toggleSettings = () => {
    setShowSettings(prev => !prev);
  };
  
  // Pantalla de carga durante la inicialización
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  // Si no hay billeteras, mostrar formulario de agregar billetera
  if (showAddWallet) {
    return <AddWalletForm onClose={() => setShowAddWallet(false)} />;
  }
  
  return (
    <div className="h-full bg-white">
      {showSettings ? (
        <Settings onClose={() => setShowSettings(false)} />
      ) : (
        <Dashboard onOpenSettings={toggleSettings} />
      )}
    </div>
  );
} 