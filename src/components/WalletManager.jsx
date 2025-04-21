import { useState } from 'react';
import { useWallet } from '../contexts/WalletProvider';
import AddWalletForm from './AddWalletForm';

export default function WalletManager() {
  const { 
    wallets, 
    currentWalletIndex, 
    setCurrentWalletIndex, 
    removeWallet, 
    updateWallet 
  } = useWallet();
  
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [editingWalletIndex, setEditingWalletIndex] = useState(null);
  const [editAlias, setEditAlias] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Función para comenzar a editar una billetera
  const startEditing = (index) => {
    setEditingWalletIndex(index);
    setEditAlias(wallets[index].alias);
  };
  
  // Función para guardar los cambios en la billetera
  const saveWalletChanges = () => {
    if (editingWalletIndex !== null && editAlias.trim()) {
      updateWallet(editingWalletIndex, { alias: editAlias.trim() });
      setEditingWalletIndex(null);
      setEditAlias('');
    }
  };
  
  // Función para cancelar la edición
  const cancelEditing = () => {
    setEditingWalletIndex(null);
    setEditAlias('');
  };
  
  // Función para confirmar eliminación
  const confirmRemoveWallet = (index) => {
    setConfirmDelete(index);
  };
  
  // Función para ejecutar la eliminación
  const executeRemoveWallet = () => {
    if (confirmDelete !== null) {
      removeWallet(confirmDelete);
      setConfirmDelete(null);
    }
  };
  
  // Función para cancelar eliminación
  const cancelRemoveWallet = () => {
    setConfirmDelete(null);
  };
  
  // Función para acortar la dirección
  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Si se está mostrando el formulario para agregar
  if (showAddWallet) {
    return <AddWalletForm onClose={() => setShowAddWallet(false)} />;
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">
        Mis billeteras ({wallets.length})
      </h3>
      
      {/* Lista de billeteras */}
      <div className="space-y-2 mb-4">
        {wallets.map((wallet, index) => (
          <div 
            key={wallet.address}
            className={`
              p-3 rounded-md border relative
              ${currentWalletIndex === index 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-white border-gray-200'
              }
              ${confirmDelete === index ? 'border-red-300 bg-red-50' : ''}
            `}
          >
            {/* Confirmación de eliminación */}
            {confirmDelete === index ? (
              <div className="p-2">
                <p className="text-sm text-red-600 mb-2">
                  ¿Estás seguro de que quieres eliminar esta billetera?
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={executeRemoveWallet}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Eliminar
                  </button>
                  <button 
                    onClick={cancelRemoveWallet}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // Contenido normal de la billetera
              <div>
                {/* Información de la billetera */}
                <div 
                  className="cursor-pointer"
                  onClick={() => setCurrentWalletIndex(index)}
                >
                  {/* Modo edición */}
                  {editingWalletIndex === index ? (
                    <div className="mb-2">
                      <input 
                        type="text" 
                        value={editAlias} 
                        onChange={e => setEditAlias(e.target.value)}
                        className="p-1 border rounded w-full"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="font-medium">{wallet.alias}</div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-1">
                    {shortenAddress(wallet.address)}
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex justify-end space-x-2 mt-2">
                  {editingWalletIndex === index ? (
                    <>
                      <button 
                        onClick={saveWalletChanges}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Guardar
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => startEditing(index)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => confirmRemoveWallet(index)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Indicador de billetera activa */}
            {currentWalletIndex === index && confirmDelete !== index && (
              <div className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2">
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Activa
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Botón para agregar billetera */}
      <button 
        onClick={() => setShowAddWallet(true)} 
        className="flex items-center justify-center w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-blue-600 hover:bg-blue-50"
      >
        + Agregar billetera
      </button>
    </div>
  );
} 