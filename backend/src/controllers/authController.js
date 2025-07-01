function signin(req, res){
    res.send({code: 200, message: "Login Test"})
}

function signup(req, res){
    const {name, email, password} = req.body;
    res.send({name, email, password});
}

module.exports = {
    signin,
    signup
}