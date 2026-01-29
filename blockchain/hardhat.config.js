require("@nomicfoundation/hardhat-toolbox");

// This line loads your .env file from the SAME folder (blockchain/)
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",

  networks: {
    hardhat: {
      chainId: 1337
    },

    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || process.env.ALCHEMY_SEPOLIA_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 20000000000,   // 20 gwei – prevents "replacement fee too low"
      timeout: 120000          // 2 minutes – prevents timeout on slow testnets
    }
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};