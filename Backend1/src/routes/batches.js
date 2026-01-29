const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const batchController = require('../controllers/batchController');
const auth = require('../middleware/auth');
const validateRole = require('../middleware/validateRole');
const { ROLES } = require('../config/constants');
const SupplyChainEvent = require('../models/SupplyChainEvent');


router.post(
    '/',
    [
        auth,
        validateRole([ROLES.SUPPLIER]),
        check('productId', 'Product ID is required').not().isEmpty(),
        check('batchNumber', 'Batch Number is required').not().isEmpty(),
        check('quantity', 'Quantity is required').isNumeric(),
        check('currentLocation', 'Location is required').not().isEmpty()
    ],
    batchController.createBatch
);

router.get('/', batchController.getAllBatches);

router.get('/my', auth, batchController.getMyBatches);

router.get('/:id', batchController.getBatch);

router.put(
    '/:id/',
    [
        auth,
        validateRole([ROLES.SUPPLIER])
    ],
    batchController.updateBatch
);

router.put(
    '/:id/status',
    [
        auth,
        validateRole([ROLES.MANUFACTURER, ROLES.DISTRIBUTOR, ROLES.RETAILER]),
        check('status', 'Status is required').not().isEmpty(),
        check('location', 'Location is required').not().isEmpty()
    ],
    batchController.updateBatchStatus
);

router.delete(
    '/:id',
    [
        auth,
        validateRole([ROLES.SUPPLIER, ROLES.ADMIN])
    ],
    batchController.deleteBatch
);

router.get('/:id/history', batchController.getBatchHistory);

// Export/Import Routes
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/export/:format', auth, batchController.exportBatches);
router.post('/import/:format', [auth, upload.single('file')], batchController.importBatches);


// GET real blockchain events for a batch
router.get('/:id/blockchain-events', async (req, res) => {
    try {
        const events = await SupplyChainEvent.find({ batchId: req.params.id })
            .sort({ timestamp: -1 })
            .lean();

        const formatted = events.map(e => ({
            ...e,
            etherscanLink: e.transactionHash
                ? `https://sepolia.etherscan.io/tx/${e.transactionHash}`
                : null
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
