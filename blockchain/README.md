# Blockchain Integration

## Setup for Real Testnet Deployment

### 1. Get Testnet ETH

**Sepolia Testnet:**
- Get free Sepolia ETH from: https://sepoliafaucet.com/
- Or: https://www.alchemy.com/faucets/ethereum-sepolia

**Goerli Testnet:**
- Get free Goerli ETH from: https://goerlifaucet.com/

### 2. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values:
   - **SEPOLIA_RPC_URL**: Get from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
   - **PRIVATE_KEY**: Export from MetaMask (Account Details > Export Private Key)
   - ⚠️ **NEVER** commit your `.env` file with real keys!

### 3. Install Dependencies

```bash
npm install
```

### 4. Compile Contract

```bash
npm run compile
```

### 5. Deploy to Testnet

**Deploy to Sepolia:**
```bash
npm run deploy:sepolia
```

**Deploy to Goerli:**
```bash
npx hardhat run scripts/deploy.js --network goerli
```

### 6. Update Backend Configuration

After deployment, copy the contract address and update `backend/src/main/resources/application.properties`:

```properties
# Enable real blockchain
blockchain.enabled=true
blockchain.simulation=false

# Network RPC URL
blockchain.rpc-url=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY

# Deployed contract address
blockchain.contract.address=0xYourDeployedContractAddress

# Deployer private key (for signing transactions)
blockchain.private-key=your_private_key
```

### 7. Verify Contract on Etherscan (Optional)

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## Testing Locally

Use Hardhat local network for development:

```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy to local network
npm run deploy:local
```

## Security Notes

- ⚠️ Never commit `.env` files with real private keys
- ⚠️ Use separate wallets for testnet and mainnet
- ⚠️ The private key in backend config should be for a dedicated service account with minimal funds
- ⚠️ For production, use proper key management solutions (AWS KMS, HashiCorp Vault, etc.)
