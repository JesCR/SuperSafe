import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { WalletProvider } from './contexts/WalletProvider';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
) 