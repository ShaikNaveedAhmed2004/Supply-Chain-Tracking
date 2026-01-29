const Batch = require('../models/Batch');
const blockchainService = require('../services/blockchainService');

exports.verifyBatch = async (req, res) => {
    try {
        const { batchNumber } = req.params;
        console.log('Verifying batch:', batchNumber);

        // Find batch by number
        const batch = await Batch.findOne({ batchNumber }).populate('productId');
        console.log('Found batch:', batch);

        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        // Verify on blockchain
        const verification = await blockchainService.verifyBatch(batch._id);
        console.log('Blockchain verification result:', verification);

        // Return flat structure matching frontend VerificationResponse interface
        const response = {
            productName: batch.productId?.name || 'Unknown Product',
            batchNumber: batch.batchNumber,
            currentLocation: batch.currentLocation,
            status: batch.status,
            isAuthentic: verification.isVerified || verification.authentic || false // Handle different property names
        };

        console.log('Sending response:', response);
        res.json(response);
    } catch (error) {
        console.error('Verify Batch Error:', error);
        res.status(500).json({ message: error.message });
    }
};