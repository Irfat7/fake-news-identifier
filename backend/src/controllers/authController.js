require('dotenv').config()
const User = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const transporter = require("../utils/email");
const emailQueue = require("../queues/emailQueue");

const signToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const signin = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.error(404, "User does not exist or wrong credentials!")
    }
    const token = signToken(email);
    res.success(token);
})

const signup = catchAsync(async (req, res) => {
    const { name, email, password } = req.body;

    /* const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({ name, email, password: hashedPassword }); */

    const verifyLink = `http://localhost:5000/api/auth/verify/${signToken(email)}`;

    await emailQueue.add('sendVerification', {
        from: process.env.GOOGLE_APP_USER,
        to: email,
        subject: "Verify your email",
        text: "Verification mail",
        html: `<p>Please verify your email by clicking <a href="${verifyLink}">here</a></p>`,
    });
    res.success(null, 200, "Verification Mail Will Be Sent");
})

const verifyToken = catchAsync(async (req, res) => {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const { email } = decoded;
    const verifiedUser = await User.update({ verified: true }, {
        where: {
            email
        }
    })
    res.success(verifiedUser, 200, "Mail verified successfully");
})

module.exports = {
    signin,
    signup,
    verifyToken
}