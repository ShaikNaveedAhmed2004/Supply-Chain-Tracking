const Product = require('../models/Product');

class ProductService {
    async createProduct(productData, userId) {
        const product = new Product({
            ...productData,
            createdBy: userId
        });
        return await product.save();
    }

    async getAllProducts() {
        return await Product.find().populate('createdBy', 'email role');
    }

    async getProduct(id) {
        const product = await Product.findById(id).populate('createdBy', 'email role');
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async updateProduct(id, productData) {
        const product = await Product.findByIdAndUpdate(
            id,
            { $set: productData },
            { new: true, runValidators: true }
        );
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async deleteProduct(id) {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
}

module.exports = new ProductService();
