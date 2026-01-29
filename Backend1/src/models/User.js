const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, USER_STATUS } = require('../config/constants');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(USER_STATUS),
        default: USER_STATUS.ACTIVE
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Configure toJSON to return id instead of _id
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,

});

module.exports = mongoose.model('User', userSchema);
