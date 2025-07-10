require('dotenv').config()
const User = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const emailQueue = require("../queues/emailQueue");

const signToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const sendVerificationMail = async (email) => {
    const verifyLink = `http://localhost:5000/api/auth/verify/${signToken(email)}`;

    await emailQueue.add('sendVerification', {
        from: process.env.GOOGLE_APP_USER,
        to: email,
        subject: "Verify your email",
        text: "Verification mail",
        html: `<p>Please verify your email by clicking <a href="${verifyLink}">here</a></p>`,
    });
}

const signin = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
        return res.error(404, "User does not exist or wrong credentials!")
    }
    if (!existingUser.verified) {
        await sendVerificationMail(email);
        return res.error(403, "Email not verified. Verification mail sent.");
    }
    const token = signToken(email);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 60 * 60 * 1000
    });
    return res.success(null, 200, "Login successful");
})

const signup = catchAsync(async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && !existingUser.verified) {
        await sendVerificationMail(email);
        return res.error(403, "Email not verified. Verification mail sent.");
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({ name, email, password: hashedPassword });

    await sendVerificationMail(email);
    return res.success(null, 200, "Verification Mail Will Be Sent");
})

const verifyToken = catchAsync(async (req, res) => {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const { email } = decoded;

    const [updated] = await User.update({ verified: true }, { where: { email } });

    if (updated === 0) {
        return res.error(400, "User already verified or not found.");
    }

    return res.success(null, 200, "Email verified successfully.");
});


module.exports = {
    signin,
    signup,
    verifyToken
}