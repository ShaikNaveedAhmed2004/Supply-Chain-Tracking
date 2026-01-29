// src/config/blockchain.js
require('dotenv').config();
const { ethers } = require('ethers');

// THIS IS THE ONLY FILE YOU NEED TO CHANGE TO GO LIVE ON SEPOLIA

if (!process.env.SEPOLIA_RPC_URL) {
    console.error("ERROR: SEPOLIA_RPC_URL is missing in .env");
    process.exit(1);
}
if (!process.env.CONTRACT_ADDRESS) {
    console.error("ERROR: CONTRACT_ADDRESS is missing in .env");
    process.exit(1);
}
if (!process.env.PRIVATE_KEY) {
    console.error("ERROR: PRIVATE_KEY is missing in .env");
    process.exit(1);
}

// CONNECT TO REAL SEPOLIA
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

// YOUR REAL WALLET (must have Sepolia ETH)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// LOAD YOUR DEPLOYED CONTRACT ABI
const SupplyChainArtifact = require('../../../blockchain/artifacts/contracts/SupplyChain.sol/SupplyChain.json');
const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    SupplyChainArtifact.abi,
    wallet
);

// LOG CONNECTION STATUS
(async () => {
    try {
        const network = await provider.getNetwork();
        const balance = await provider.getBalance(wallet.address);
        console.log("\nCONNECTED TO SEPOLIA");
        console.log("Network:", network.name, "(chainId:", network.chainId + ")");
        console.log("Contract:", process.env.CONTRACT_ADDRESS);
        console.log("Wallet:", wallet.address);
        console.log("Balance:", ethers.formatEther(balance), "ETH\n");
    } catch (err) {
        console.error("Failed to connect to Sepolia:", err.message);
    }
})();

module.exports = {
    provider,
    wallet,
    contract,
    getProvider: () => provider,
    getSigner: () => wallet,
    getContract: () => contract
};