const User = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
require('dotenv').config()

const signToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const signin = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({where: {email}});
    if(!user || !(await bcrypt.compare(password, user.password))){
        res.error(404, "User does not exist or wrong credentials!")
    }
    const token = signToken(user);
    res.success(token);
})

const signup = catchAsync(async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({ name, email, password: hashedPassword });
    const token = signToken(newUser);
    res.success(token);
})

module.exports = {
    signin,
    signup
}