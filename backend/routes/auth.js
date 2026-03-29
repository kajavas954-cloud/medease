const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'medease_secret_key_123';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, age, gender, bloodGroup } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Dummy photo logic based on gender
    let color = "cccccc"; // Default grey
    if (gender === "Male") color = "3498db"; // Blue
    else if (gender === "Female") color = "e84393"; // Pink
    
    const profilePicUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23${color}"><path d="M24 20.993V24H0v-2.996A5.006 5.006 0 0 1 5.003 16H19A5 5 0 0 1 24 20.993zM12 15a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/></svg>`;

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      age: age || null,
      gender: gender || null,
      bloodGroup: bloodGroup || null,
      profilePicUrl
    });

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT
    const payload = { 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        streetAddress: user.streetAddress,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        profilePicUrl: user.profilePicUrl
      } 
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: payload.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Modify Password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Address
router.put('/update-address', auth, async (req, res) => {
  try {
    const { streetAddress, city, state, postalCode } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.streetAddress = streetAddress;
    user.city = city;
    user.state = state;
    user.postalCode = postalCode;
    await user.save();

    res.json({ message: 'Address updated successfully!', user });
  } catch (err) {
    console.error("Update Address Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- FORGOT PASSWORD FLOW ---

// Create a test account for Nodemailer if credentials are not provided
let transporter;
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return;
  }
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User with this email does not exist' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send email
    let testUrl = null;
    if (transporter) {
      const info = await transporter.sendMail({
        from: '"MedEase" <noreply@medease.com>',
        to: email,
        subject: 'Your Password Reset OTP',
        text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
        html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 10 minutes.</p>`
      });
      testUrl = nodemailer.getTestMessageUrl(info);
      console.log('Password reset email sent: %s', testUrl);
    }

    res.json({ message: 'OTP sent to email successfully', url: testUrl });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: 'Server error while processing forgot password' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: 'Server error while verifying OTP' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
});

module.exports = router;
