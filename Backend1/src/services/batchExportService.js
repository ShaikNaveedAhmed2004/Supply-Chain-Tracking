const Batch = require('../models/Batch');
const Product = require('../models/Product');
const { Parser } = require('json2csv');
const csv = require('csv-parser');
const fs = require('fs');

exports.exportBatches = async (format) => {
    const batches = await Batch.find().populate('productId', 'name');

    const data = batches.map(batch => ({
        id: batch.id,
        batchNumber: batch.batchNumber,
        productName: batch.productId ? batch.productId.name : 'Unknown',
        quantity: batch.quantity,
        currentLocation: batch.currentLocation,
        status: batch.status,
        createdAt: batch.createdAt
    }));

    if (format === 'json') {
        return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
        const fields = ['id', 'batchNumber', 'productName', 'quantity', 'currentLocation', 'status', 'createdAt'];
        const json2csvParser = new Parser({ fields });
        return json2csvParser.parse(data);
    } else {
        throw new Error('Unsupported format');
    }
};

exports.importBatches = async (filePath, format) => {
    const results = [];

    if (format === 'json') {
        const data = fs.readFileSync(filePath, 'utf8');
        const batches = JSON.parse(data);
        // Process batches... logic to create them in DB
        // This is a simplified version, ideally we should validate and create properly
        return batches;
    } else if (format === 'csv') {
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (error) => reject(error));
        });
    }
};
