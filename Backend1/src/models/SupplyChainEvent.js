const mongoose = require('mongoose');

const supplyChainEventSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    fromParty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    toParty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    transactionHash: {
        type: String
    },
    blockNumber: {
        type: Number
    }
});

supplyChainEventSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('SupplyChainEvent', supplyChainEventSchema);
