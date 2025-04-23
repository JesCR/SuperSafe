# SuperSafe - Technical Documentation

## Index
1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Main Components](#main-components)
5. [Contexts and State Management](#contexts-and-state-management)
6. [Security](#security)
7. [Networks and Configuration](#networks-and-configuration)
8. [Storage](#storage)
9. [Key Features](#key-features)
10. [Development Guide](#development-guide)
11. [Deployment](#deployment)

## Introduction

SuperSafe is a digital wallet web application that allows users to manage their digital assets on the SuperSeed blockchain. The application offers functionalities such as managing multiple wallets, sending and receiving tokens, transaction management, and robust security features.

### Main Technologies

- React.js: Frontend framework (v18.2.0)
- Ethers.js: Library for blockchain interaction (v5.7.2)
- TailwindCSS: CSS framework for interface design (v3.3.3)
- Vite: Build and development tool (v4.4.5)
- Web Crypto API: Native API for secure cryptographic operations

## Architecture

SuperSafe follows a modular component architecture with centralized state management through React's Context API.

### Architecture Diagram

```
+----------------------------------+
|            SuperSafe             |
+----------------------------------+
               |
               v
+----------------------------------+
|        WalletProvider            | <-- Global State Management
+----------------------------------+
               |
       +-------+-------+
       |               |
       v               v
+-------------+  +-------------+
| Components  |  |  Utilities  |
+-------------+  +-------------+
|  Dashboard  |  |   crypto    |
|  Settings   |  |   storage   |
|  AddWallet  |  |   networks  |
|     ...     |  |     ...     |
+-------------+  +-------------+
```

## Project Structure

```
SuperSafe/
├── dist/                  # Compiled files
├── public/                # Static assets
├── src/                   # Source code
│   ├── components/        # React components
│   ├── contexts/          # Context providers
│   ├── styles/            # Additional styles
│   ├── utils/             # Utilities and helpers
│   ├── App.jsx            # Root component
│   ├── index.css          # Global styles
│   └── main.jsx           # Entry point
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
└── vite.config.js         # Vite configuration
```

## Main Components

### App.jsx
Root component that handles the main navigation between Dashboard, Settings, and the add wallet form.

### Dashboard.jsx
Main panel displaying current wallet information, balances, and available actions. Integrates with other components such as BalanceList, TransactionsList, and EcosystemGrid.

### Settings.jsx
Component to manage configurations like security, wallet options, custom tokens, and network selection.

### AddWalletForm.jsx
Form to create or import a new wallet using a seed phrase or private key.

### SendTokenForm.jsx
Component to send tokens to other addresses, with validation and transaction confirmation.

### BalanceList.jsx
Displays available token balances in the current wallet.

### TransactionsList.jsx
List of historical transactions with filtering and sorting.

### NetworkSwitcher.jsx
Selector to switch between different networks (mainnet, devnet).

### WalletManager.jsx
Component to manage multiple wallets, including profile editing and deletion.

## Contexts and State Management

### WalletProvider
Provides the global state and functions for:
- Wallet management (add, remove, update)
- Network and token management
- Transaction functions (send ETH and tokens)
- Security mechanisms (lock, unlock, encryption)
- Configuration persistence

```jsx
// Example of context usage in components
const { wallets, currentWallet, sendETH } = useWallet();
```

### Main States:
- `wallets`: List of user wallets
- `currentWalletIndex`: Index of the active wallet
- `networkKey`: Current network (mainnet, devnet)
- `isLocked`: Application lock state
- `securityToggles`: Security configurations

## Security

SuperSafe implements multiple security layers to protect user assets:

### Private Key Encryption
- Algorithm: AES-GCM (industry standard)
- Key derivation: PBKDF2 with 100,000 iterations
- Private keys are never stored in plain text

### Password Protection
- Password hashing with PBKDF2 (210,000 iterations)
- Comparison resistant to timing attacks
- Unique salt for each password hash

### Configurable Security Options
- Automatic lock after 5 minutes of inactivity
- Lock on application exit
- Transaction confirmation
- Balance hiding

### Additional Measures
- Validation of all user inputs
- Protection against duplicate wallet import attempts
- Verification of addresses and private keys

## Networks and Configuration

SuperSafe supports multiple blockchain networks:

### Available Networks
1. **SuperSeed Mainnet**
   - ChainID: 5330
   - Currency: ETH
   - RPC URL: https://mainnet.superseed.xyz
   - Explorer: https://explorer.superseed.xyz

2. **SuperSeed Sepolia (Testnet)**
   - ChainID: 53302
   - Currency: ETH
   - RPC URL: https://sepolia.superseed.xyz
   - Explorer: https://sepolia-explorer.superseed.xyz

### Preconfigured Tokens
- USDC and USDT available on both networks
- Support for adding custom tokens

## Storage

SuperSafe uses local storage (localStorage) to persist data:

### Stored Data
- Encrypted wallets (no plain-text private keys)
- User configurations
- Current wallet index
- Selected network
- Custom tokens
- Password hash (not the password itself)

### Storage Mechanisms
- `saveWallets()`: Saves the list of wallets
- `loadWallets()`: Loads wallets from localStorage
- `saveSetting()`: Saves a specific configuration
- `loadSetting()`: Loads a configuration from localStorage

## Key Features

### Wallet Management
- Creation of new wallets
- Import via seed phrase (mnemonic)
- Import via private key
- Customization (alias, profile image)
- Support for multiple wallets

### Transactions
- Sending native ETH
- Sending ERC-20 tokens
- Transaction history visualization
- Transaction confirmation with password

### Token Management
- Token balance visualization
- Addition of custom tokens
- Support for tokens with different decimals

### User Interface
- Responsive design with TailwindCSS
- Light/dark themes (in development)
- Loading indicators for operations
- Detailed error messages

## Development Guide

### Prerequisites
- Node.js v16 or higher
- npm v7 or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/username/SuperSafe.git

# Install dependencies
cd SuperSafe
npm install
```

### Main Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview the build
npm run preview
```

### Component Structure
```jsx
import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletProvider';

export default function ExampleComponent() {
  const { currentWallet } = useWallet();
  const [state, setState] = useState(initial);

  // Component logic...

  return (
    <div className="component-container">
      {/* Component content */}
    </div>
  );
}
```

### Best Practices
1. Use context hooks to access global state
2. Implement input validation in all forms
3. Handle loading and error states appropriately
4. Follow existing naming conventions
5. Implement additional security checks in critical functions

## Deployment

### Build Process
1. Run `npm run build` to generate optimized files
2. Production files are generated in the `dist/` directory

### Deployment Options
- **Static Web Server**: Apache, Nginx
- **Hosting Services**: Netlify, Vercel, GitHub Pages
- **Containers**: Docker with Nginx as web server

### Production Configuration
- Ensure RPC URLs are correct for the production environment
- Verify token contract addresses on the main network
- Implement error monitoring and analysis (e.g. Sentry)

---

## Conclusion

SuperSafe is a secure and comprehensive digital wallet for the SuperSeed network. With a focus on security and usability, it provides all the necessary tools to efficiently manage digital assets. This document serves as a complete technical reference for developers and system administrators.

---

*Documentation created on August 1, 2023*  
*Last update: August 1, 2023* 