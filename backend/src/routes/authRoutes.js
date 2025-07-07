const express = require("express")
const router = express.Router()
const {signin, signup, verifyToken} = require("../controllers/authController")
const {createUserValidator, signinValidator} = require("../validators/userValidators")
const validate = require('../middlewares/validate')

router.get("/signin", signinValidator, validate, signin);
router.post("/signup", createUserValidator, validate, signup);
router.get("/verify/:token", verifyToken);

module.exports = router