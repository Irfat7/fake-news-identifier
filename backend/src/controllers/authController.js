const User = require("../models/user.model");


function signin(req, res){
    res.send({code: 200, message: "Login Test"})
}

async function signup(req, res, next){
    const {name, email, password} = req.body;
    try {
        const newUser = await User.create({name, email, password});
        res.send({name, email, password});
    } catch (error) {
        next(error)
    }
}

module.exports = {
    signin,
    signup
}