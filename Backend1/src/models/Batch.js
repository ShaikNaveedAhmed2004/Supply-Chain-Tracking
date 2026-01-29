const mongoose = require('mongoose');
const { BATCH_STATUS } = require('../config/constants');

const batchSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    batchNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    currentOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentLocation: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(BATCH_STATUS),
        default: BATCH_STATUS.CREATED
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

batchSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,

});

module.exports = mongoose.model('Batch', batchSchema);
