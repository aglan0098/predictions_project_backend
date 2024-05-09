const mongoose = require('mongoose');

const monthlyDataSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true,
    },
    close_price: {
        type: String,
        required: true,
    },
    open_price: {
        type: String,
        required: true,
    },
    volume: {
        type: String,
        required: true,
    },
    high_price: {
        type: String,
        required: true,
    },
    low_price: {
        type: String,
        required: true,
    },
    adjust_close_price: {
        type: String,
        required: true,
    },
});

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    monthlyData: [monthlyDataSchema],
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
