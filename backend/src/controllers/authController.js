const User = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");


const signin = (req, res) => {
    res.send({ code: 200, message: "Login Test" })
}

const signup = catchAsync(async(req, res)=>{
    const { name, email, password } = req.body;
    const newUser = await User.create({ name, email, password });
    res.success(newUser);
})

module.exports = {
    signin,
    signup
}