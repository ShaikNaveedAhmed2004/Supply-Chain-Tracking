# Chain Trace Backend (Node.js)

This is the new Node.js/Express.js backend for Chain Trace, replacing the Spring Boot application.

## Prerequisites

- Node.js (v18+)
- MongoDB Atlas Account
- Local Hardhat Node (for blockchain simulation)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Check `.env` file and update `MONGODB_URI` if needed.
   - Ensure `BLOCKCHAIN_CONTRACT_ADDRESS` matches your deployed contract.

3. Start Hardhat Node (in a separate terminal):
   ```bash
   cd ../blockchain
   npx hardhat node
   ```

4. Deploy Smart Contract (if not already done):
   ```bash
   cd ../blockchain
   npx hardhat run scripts/deploy.js --network localhost
   ```
   Update `BLOCKCHAIN_CONTRACT_ADDRESS` in `.env` with the new address.

## Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Products**: `/api/products` (CRUD)
- **Batches**: `/api/batches` (CRUD + Status Updates)
- **Consumer**: `/api/consumer/verify/:batchNumber`

## Blockchain Integration

The backend automatically connects to the local Hardhat node at `http://localhost:8545`.
Events are recorded on-chain when:
- A new batch is created
- A batch status is updated
