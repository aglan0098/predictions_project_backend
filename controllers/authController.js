const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// send verification code to email 
const verificationCodes = {};

async function sendVerificationCode(req, res) {
    const { email } = req.body;

    // Check if the email is already registered
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        return res.status(409).json({ error: 'Email already exists' });
    }

    // Generate random verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000);

    // Store the verification code temporarily
    verificationCodes[email] = verificationCode;

    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: 'reactproject007@gmail.com',
                pass: 'zvjg iwoy qjhh tnud',
            },
        });

        const mailOptions = {
            from: 'reactproject007@gmail.com',
            to: email,
            subject: 'Verification Code for Registration',
            text: `Your verification code is: ${verificationCode}`,
        };

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email: ", error);
            } else {
                console.log("Email sent: ", info.response);
            }
        });

        res.status(200).json({ message: 'Verification code sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// register the user
async function registerUser(req, res) {
    try {
        const { email, first, last, username, password, verificationCode, isAdmin } = req.body;

        // Check if the verification code matches
        if (verificationCodes[email] === parseInt(verificationCode)) {
            console.log('Verification code is valid.');
        }
        else {
            return res.status(400).json({ error: 'Invalid verification code.' });
        }

        // Clear the verification code after successful registration
        delete verificationCodes[email];

        // Create user
        const user = new User({ email, first, last, username, password, isAdmin });
        await user.save();
        const token = jwt.sign({ userId: user._id }, 'your_secret_key');

        res.status(201).json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// login
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            return res.status(401).json({ error: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.error("Password mismatch. Incorrect password.");
            return res.status(401).json({ error: "Password is incorrect, please try again" });
        }

        const token = jwt.sign({ userId: user._id }, "your_secret_key");
        res.status(200).json({ token, user });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Update User
async function updateUserProfile(req, res) {
    try {
        // const { userId } = req.user; // Assuming you have middleware to extract userId from JWT
        const { userId, first, last, email } = req.body;

        // Find the user by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user data
        user.first = first || user.first;
        user.last = last || user.last;
        user.email = email || user.email;
        // if (password) {
        //     // Hash and update password if new password is provided
        //     const hashedPassword = await bcrypt.hash(password, 10);
        //     user.password = hashedPassword;
        // }

        // Save the updated user data
        await user.save();

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// reset password
async function resetPassword(req, res) {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // If user doesn't exist, return error
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Hash the new password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password
        user.password = password;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { sendVerificationCode, registerUser, loginUser, updateUserProfile, resetPassword };
