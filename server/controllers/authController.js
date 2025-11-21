const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email');
const { getVerificationEmail, getWelcomeEmail } = require('../templates/emailTemplates');

const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
};

const generateRefreshToken = async (user) => {
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await RefreshToken.create({
        userId: user._id,
        token: token,
        expiresAt: expiresAt
    });

    return token;
};

exports.signup = async (req, res) => {
    try {
        const { email, password, displayName } = req.body;
        if (!email || !password || !displayName) return res.status(400).json({ message: 'All fields are required' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const passwordHash = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.create({
            email,
            passwordHash,
            displayName,
            verificationCode
        });

        // Send beautiful verification email
        const emailHtml = getVerificationEmail(verificationCode, displayName);
        await emailService.sendEmail(
            email,
            'Verify Your MingleX Account 🎉',
            emailHtml
        );

        res.status(201).json({ message: 'User created successfully. Please check your email for verification code.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.verified) return res.status(400).json({ message: 'User already verified' });
        if (user.verificationCode !== code) return res.status(400).json({ message: 'Invalid verification code' });

        user.verified = true;
        user.verificationCode = undefined;
        await user.save();

        // Send welcome email
        const welcomeEmailHtml = getWelcomeEmail(user.displayName);
        await emailService.sendEmail(
            email,
            'Welcome to MingleX! ✨',
            welcomeEmailHtml
        );

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const accessToken = generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({ accessToken, user: { id: user._id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
    if (!tokenDoc || tokenDoc.revoked) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({ _id: user.id, email: user.email });
        res.json({ accessToken });
    });
};

exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true });
        }
        res.clearCookie('refreshToken');
        res.sendStatus(204);
    } catch (error) {
        console.error("Logout error:", error);
        res.sendStatus(204); // Always return success for logout
    }
};
