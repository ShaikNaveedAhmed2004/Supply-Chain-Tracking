const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
    async register(userData) {
        const { email, password, role } = userData;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            throw new Error('User already exists');
        }

        // Create user
        user = new User({
            email,
            passwordHash: password, // Will be hashed by pre-save hook
            role
        });

        await user.save();

        const token = this.generateToken(user);

        return {
            token,
            type: 'Bearer',
            id: user._id,
            email: user.email,
            role: user.role
        };
    }

    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user);

        return {
            token,
            type: 'Bearer',
            id: user._id,
            email: user.email,
            role: user.role
        };
    }

    generateToken(user) {
        return jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '24h' }
        );
    }
}

module.exports = new AuthService();
