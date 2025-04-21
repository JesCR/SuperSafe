// SuperSeed Network Configuration
export const NETWORKS = {
  mainnet: {
    name: "SuperSeed Mainnet",
    chainId: 5330,
    rpcUrl: "https://mainnet.superseed.xyz",
    wsUrl: "wss://mainnet.superseed.xyz",
    currency: "ETH",
    explorer: "https://explorer.superseed.xyz",
    testnet: false
  },
  devnet: {
    name: "SuperSeed Sepolia",
    chainId: 53302,
    rpcUrl: "https://sepolia.superseed.xyz",
    wsUrl: null,
    currency: "ETH",
    explorer: "https://sepolia-explorer.superseed.xyz",
    testnet: true
  }
};

// Preloaded token contracts (addresses on mainnet & devnet)
export const PRELOADED_TOKENS = {
  mainnet: [
    { symbol: "USDC", address: "0xC316C8252B5F2176d0135Ebb0999E99296998F2e", decimals: 6 },
    { symbol: "USDT", address: "0xc5068BB6803ADbe5600DE5189fe27A4dAcE31170", decimals: 6 }
  ],
  devnet: [
    { symbol: "USDC", address: "0x85773169ee07022AA2b4785A5e69803540E9106A", decimals: 6 },
    { symbol: "USDT", address: "0x9D905c8048DB2e093b5905d047aEeda5a0C6784D", decimals: 6 }
  ]
};

// Minimal ERC-20 ABI for interacting with tokens
export const ERC20_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  // Write functions
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint amount) returns (bool)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint amount)"
]; 