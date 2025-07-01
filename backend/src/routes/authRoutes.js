const express = require("express")
const router = express.Router()
const {signin, signup} = require("../controllers/authController")
const {createUserValidator, signinValidator} = require("../validators/userValidators")
const validate = require('../middlewares/validate')

router.get("/signin", signinValidator, validate, signin);
router.post("/signup", createUserValidator, validate, signup);

module.exports = router