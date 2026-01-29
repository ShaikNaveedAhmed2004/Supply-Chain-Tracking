// Backend1/src/services/blockchainService.js

const { getContract, getSigner } = require('../config/blockchain');

class BlockchainService {
    constructor() {
        this.contract = null;
        this.signer = null;
    }

    async initialize() {
        if (this.contract && this.signer) return;

        this.signer = await getSigner();
        this.contract = getContract(this.signer);
        console.log('\x1b[32m[BLOCKCHAIN] Connected to Sepolia contract:\x1b[0m', this.contract.target || this.contract.address);
    }

    convertToBlockchainId(mongoId) {
        const hexString = mongoId.toString().substring(0, 16);
        const batchIdBigInt = BigInt('0x' + hexString);
        console.log(`ID Conversion: ${mongoId} → 0x${hexString} → ${batchIdBigInt}`);
        return batchIdBigInt;
    }

    async recordSupplyChainEvent(batchId, productId, fromParty, toParty, location, status) {
        await this.initialize();

        const batchIdBigInt = this.convertToBlockchainId(batchId);

        console.log(`\nRecording event for batch ${batchId} on Sepolia blockchain...`);
        console.log(`- Blockchain ID: ${batchIdBigInt}`);
        console.log(`- Product ID: ${productId}`);
        console.log(`- Location: ${location}`);
        console.log(`- Status: ${status}`);
        console.log(`- Signer: ${this.signer.address}`);

        const tx = await this.contract.recordEvent(
            batchIdBigInt,
            productId.toString(),
            this.signer.address,
            this.signer.address,
            location,
            status
        );

        console.log(`Transaction sent: https://sepolia.etherscan.io/tx/${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}\n`);

        return {
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
            blockchainBatchId: batchIdBigInt.toString()
        };
    }

    async getEventsForBatch(batchId) {
        await this.initialize();

        const batchIdBigInt = this.convertToBlockchainId(batchId);

        const events = await this.contract.getEventsByBatchId(batchIdBigInt);

        return events.map(event => ({
            batchId: event.batchId.toString(),
            productId: event.productId,
            fromParty: event.fromParty,
            toParty: event.toParty,
            location: event.location,
            status: event.status,
            timestamp: new Date(Number(event.timestamp) * 1000).toISOString(),
            transactionHash: event.transactionHash || null,
            blockNumber: event.blockNumber || null
        }));
    }

    async verifyBatch(batchId) {
        const events = await this.getEventsForBatch(batchId);
        return {
            isVerified: events.length > 0,
            eventCount: events.length,
            events
        };
    }
}

// THIS LINE WAS MISSING OR BROKEN — THIS IS THE FIX
module.exports = new BlockchainService();