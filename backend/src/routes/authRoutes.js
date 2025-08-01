const express = require("express")
const router = express.Router()
const {signin, signup, verifyToken, verify} = require("../controllers/authController")
const {createUserValidator, signinValidator} = require("../validators/userValidators")
const validate = require('../middlewares/validate')

router.post("/signin", signinValidator, validate, signin);
router.post("/signup", createUserValidator, validate, signup);
router.get("/verify/:token", verifyToken);
router.get("/verify-token/", verify);

module.exports = router