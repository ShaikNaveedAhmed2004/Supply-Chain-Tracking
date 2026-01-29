#!/bin/bash
# Script to generate Java wrapper for SupplyChain smart contract

# 1. Compile contracts
echo "Compiling contracts..."
cd ../blockchain
npx hardhat compile
cd ../backend

# 2. Create output directory
mkdir -p src/main/java/com/supplychain/blockchain

# 3. Generate Wrapper using Web3j CLI
# Assumes web3j-cli is available in the root directory or PATH
echo "Generating Java wrapper..."
../../web3j-cli-shadow-1.4.1/bin/web3j generate truffle \
    --truffle-json ../blockchain/artifacts/contracts/SupplyChain.sol/SupplyChain.json \
    -o src/main/java \
    -p com.supplychain.blockchain

echo "Done!"
