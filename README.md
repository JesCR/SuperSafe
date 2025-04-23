# SuperSafe Wallet

![(public/logo.png)](https://github.com/JesCR/SuperSafe/blob/main/public/SuperSafe_2line.png)

A secure digital wallet for managing assets on the SuperSeed blockchain, with an architecture focused on security and user experience.

**Documentation:** [Technical Documentation](DOCUMENTATION.md) | [Security Model](SECURITY.md) | [User Guide](USER_GUIDE.md)

**Demo:** [![Watch the video](https://i.sstatic.net/Vp2cE.png)](https://youtu.be/xV-3PIRnCN8)
## 🚀 Key Features

- **Multi-network**: Compatible with SuperSeed Mainnet (ID 5330) and Devnet Sepolia (ID 53302)
- **Account management**: Import or create wallets using seed phrase or private key
- **Asset management**: View and transfer ETH and ERC-20 tokens
- **Transactions**: Send, receive, and monitor transactions
- **Advanced security**: AES-GCM encryption with PBKDF2 key derivation
- **Local storage**: Encrypted sensitive data stored locally
- **Customization**: Configure security options according to your preferences
- **Custom token support**: Add any ERC-20 token to your wallet

## 🔒 Security

SuperSafe implements a multi-layer security model designed to protect users' private keys:

- **User custody**: Private keys remain under the exclusive control of the user
- **End-to-end encryption**: All sensitive keys are encrypted locally
- **Zero knowledge**: The application cannot access keys without the user's password
- **Defense in depth**: Multiple security layers operate simultaneously

For more security details, check [SECURITY.md](SECURITY.md).

## 🏗️ Architecture

SuperSafe uses a client-centered architecture where all critical operations are performed locally in the user's browser:

```
+-------------------------------------------+    +-------------------------+
|               USER'S BROWSER              |    |      BLOCKCHAIN         |
+-------------------------------------------+    +-------------------------+
|                                           |    |                         |
|  +-------------+      +---------------+   |    |                         |
|  |             |      |               |   |    |                         |
|  |   REACT     +----->+    WALLET     +---+--->+  SUPERSEED BLOCKCHAIN  |
|  |  INTERFACE  |      |  CONTROLLER   |   |    |                         |
|  |             |      |               |   |    |                         |
|  +------+------+      +-------+-------+   |    |                         |
|         ^                     ^           |    |                         |
|         |                     |           |    |                         |
|         v                     v           |    |                         |
|  +------+------+      +-------+-------+   |    |                         |
|  |             |      |               |   |    |                         |
|  |    REACT    |      |   SECURITY    |   |    |                         |
|  |  CONTEXTS   |      |    MODULES    |   |    |                         |
|  |             |      |               |   |    |                         |
|  +------+------+      +-------+-------+   |    |                         |
|         ^                     ^           |    |                         |
|         |                     |           |    |                         |
|         v                     v           |    |                         |
|  +------+------+      +-------+-------+   |    |                         |
|  |             |      |               |   |    |                         |
|  |  UTILITIES  |      |   ENCRYPTED   |   |    |                         |
|  |             |      |    STORAGE    |   |    |                         |
|  +-------------+      +---------------+   |    |                         |
|                                           |    |                         |
+-------------------------------------------+    +-------------------------+
```

Key components:
- **React Interface**: UI components and presentation logic
- **Wallet Controller**: Wallet management and blockchain operations
- **React Contexts**: Global state and data management in the application
- **Security Modules**: Encryption, authentication, and data protection
- **Utilities**: Helper functions for various operations
- **Encrypted Storage**: Secure persistence of sensitive data

## 🛠️ Technologies

- **Frontend**: React 18.2
- **Styling**: TailwindCSS 3.3
- **Bundler**: Vite 4.4
- **Blockchain**: ethers.js 5.7
- **Storage**: IndexedDB (idb 7.1)
- **UI Components**: Optimized custom components

## 📋 Requirements

- Node.js 14 or higher
- npm 7 or higher
- Modern browser with Web Crypto API support

## 💻 Installation and Development

### Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/SuperSafe.git
cd SuperSafe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Main Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production version
npm run preview
```

### Build for Production

```bash
npm run build
```

The generated files will be in the `dist` folder.

### Using as a Chrome Extension

1. Run `npm run build` to generate the production version
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click on "Load unpacked" and select the `dist` folder

## 📚 Documentation

- [DOCUMENTATION.md](DOCUMENTATION.md) - Complete technical documentation
- [USER_GUIDE.md](USER_GUIDE.md) - Detailed user guide
- [SECURITY.md](SECURITY.md) - Information about the security model

## 🛣️ Roadmap

Here are some planned developments for upcoming versions:

### Upcoming Features

- **NFT Support**: View and manage non-fungible tokens (ERC-721/ERC-1155)
- **dApp Integration**: Direct connection with decentralized applications
- **Push Notifications**: Alerts for received transactions and network changes
- **Advanced Backup Options**: Multiple mechanisms for wallet backups
- **Hardware Wallet Support**: Integration with Ledger and Trezor

### Technical Improvements

- **Performance Optimization**: Reduction of loading times and resource consumption
- **Security Improvements**: Regular audits and reviews
- **Multi-language Support**: Complete internationalization of the application
- **Automated Testing**: Expansion of test coverage
- **TypeScript Migration**: Improved type system for greater robustness

## 🤝 Contribution

Contributions are welcome. Please read our contribution guide before submitting a pull request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
