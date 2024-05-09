const express = require('express');
const router = express.Router();
const { sendVerificationCode, registerUser, loginUser, updateUserProfile, resetPassword } = require('./authController');
const { addCompanyData, getCompanyData, getCurrentPrice } = require('./companyController');

// Routes
router.post('/sendVerificationCode', sendVerificationCode);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/update', updateUserProfile);
router.post('/reset-password', resetPassword);
router.post('/company', addCompanyData);
router.get('/company-data', getCompanyData);
router.get('/current-prices', getCurrentPrice);

module.exports = router;
