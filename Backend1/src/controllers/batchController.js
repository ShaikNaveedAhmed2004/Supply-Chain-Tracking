const batchService = require('../services/batchService');
const batchExportService = require('../services/batchExportService');
const { validationResult } = require('express-validator');
const Batch = require('../models/Batch.js'); // ← no curly braces, lowercase file

// CREATE NEW BATCH
exports.createBatch = async (req, res) => {
    try {
        // 1. Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const batchData = req.body;

        // 2. VERY IMPORTANT: Pass the authenticated user's ID, NOT res!
        const newBatch = await batchService.createBatch(batchData, req.user.id);

        return res.status(201).json({
            message: 'Batch created successfully',
            batch: newBatch
        });

    } catch (error) {
        console.error('Create Batch Error:', error);
        return res.status(500).json({
            message: 'Failed to create batch',
            error: error.message
        });
    }
};

// GET ALL BATCHES
exports.getAllBatches = async (req, res) => {
    try {
        const batches = await batchService.getAllBatches();
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET SINGLE BATCH BY ID
exports.getBatch = async (req, res) => {
    try {
        const batch = await batchService.getBatch(req.params.id);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        res.json(batch);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// UPDATE BATCH (Supplier only)
exports.updateBatch = async (req, res) => {
    try {
        const updateData = req.body;
        const batch = await batchService.updateBatch(req.params.id, updateData, req.user.id);
        res.json(batch);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// UPDATE BATCH STATUS (Manufacturer/Distributor/Retailer)
exports.updateBatchStatus = async (req, res) => {
    try {
        const { status, location } = req.body;
        const batch = await batchService.updateBatchStatus(req.params.id, { status, location }, req.user.id);
        res.json(batch);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE BATCH
exports.deleteBatch = async (req, res) => {
    try {
        await batchService.deleteBatch(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// GET BATCH HISTORY
exports.getBatchHistory = async (req, res) => {
    try {
        const history = await batchService.getBatchHistory(req.params.id);
        res.json(history);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// GET MY BATCHES (for logged-in user)
exports.getMyBatches = async (req, res) => {
    try {
        const batches = await batchService.getMyBatches(req.user.id);
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// EXPORT BATCHES (JSON/CSV)
exports.exportBatches = async (req, res) => {
    try {
        const { format } = req.params;
        const data = await batchExportService.exportBatches(format);

        if (format === 'json') {
            res.header('Content-Type', 'application/json');
            res.attachment('batches.json');
            res.send(data);
        } else if (format === 'csv') {
            res.header('Content-Type', 'text/csv');
            res.attachment('batches.csv');
            res.send(data);
        } else {
            res.status(400).json({ message: 'Unsupported format' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// IMPORT BATCHES (from file)
exports.importBatches = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const { format } = req.params;
        const result = await batchExportService.importBatches(req.file.path, format, req.user.id);

        // Optional: clean up uploaded file
        require('fs').unlinkSync(req.file.path);

        res.json({ message: 'Import successful', imported: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = exports;