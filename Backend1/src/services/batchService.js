const Batch = require('../models/Batch');
const SupplyChainEvent = require('../models/SupplyChainEvent');
const blockchainService = require('./blockchainService');
const { BATCH_STATUS } = require('../config/constants');

class BatchService {
    async createBatch(batchData, userId) {
        const batch = new Batch({
            ...batchData,
            currentOwner: userId,
            status: BATCH_STATUS.CREATED
        });
        await batch.save();

        // Record event on blockchain
        try {
            const tx = await blockchainService.recordSupplyChainEvent(
                batch._id,
                batch.productId,
                userId,
                userId,
                batch.currentLocation,
                BATCH_STATUS.CREATED
            );

            // Save event to DB
            const event = new SupplyChainEvent({
                batchId: batch._id,
                productId: batch.productId,
                fromParty: userId,
                toParty: userId,
                location: batch.currentLocation,
                status: BATCH_STATUS.CREATED,
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber
            });
            await event.save();
        } catch (error) {
            console.error('Blockchain recording failed:', error);
            // We might want to rollback or mark as pending sync
        }

        return batch;
    }

    async getAllBatches() {
        return await Batch.find()
            .populate('productId', 'name sku')
            .populate('currentOwner', 'email role');
    }

    async getBatch(id) {
        const batch = await Batch.findById(id)
            .populate('productId', 'name sku')
            .populate('currentOwner', 'email role');
        if (!batch) {
            throw new Error('Batch not found');
        }
        return batch;
    }

    async updateBatch(id, batchData) {
        const batch = await Batch.findByIdAndUpdate(
            id,
            { $set: batchData },
            { new: true, runValidators: true }
        );
        if (!batch) {
            throw new Error('Batch not found');
        }
        return batch;
    }

    async updateBatchStatus(id, statusData, userId) {
        const { status, location, toPartyId } = statusData;

        const batch = await Batch.findById(id);
        if (!batch) {
            throw new Error('Batch not found');
        }

        const fromParty = batch.currentOwner;

        // Update batch
        batch.status = status;
        batch.currentLocation = location;
        if (toPartyId) {
            batch.currentOwner = toPartyId;
        }
        await batch.save();

        // Record event on blockchain
        try {
            const tx = await blockchainService.recordSupplyChainEvent(
                batch._id,
                batch.productId,
                fromParty,
                batch.currentOwner,
                location,
                status
            );

            // Save event to DB
            const event = new SupplyChainEvent({
                batchId: batch._id,
                productId: batch.productId,
                fromParty: fromParty,
                toParty: batch.currentOwner,
                location: location,
                status: status,
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber
            });
            await event.save();
        } catch (error) {
            console.error('Blockchain recording failed:', error);
        }

        return batch;
    }

    async deleteBatch(id) {
        const batch = await Batch.findByIdAndDelete(id);
        if (!batch) {
            throw new Error('Batch not found');
        }
        return batch;
    }

    async getBatchHistory(id) {
        // Get from DB
        const dbEvents = await SupplyChainEvent.find({ batchId: id })
            .populate('fromParty', 'email role')
            .populate('toParty', 'email role')
            .sort({ timestamp: -1 });

        // Get from Blockchain (optional verification)
        // const chainEvents = await blockchainService.getEventsForBatch(id);

        return dbEvents;
    }

    async getMyBatches(userId) {
        return await Batch.find({ currentOwner: userId })
            .populate('productId', 'name sku');
    }
}

module.exports = new BatchService();
