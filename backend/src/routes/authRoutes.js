const express = require("express")
const router = express.Router()
const {signin, signup} = require("../controllers/authController")
const {createUserValidator} = require("../validators/userValidators")
const validate = require('../middlewares/validate')

router.get("/signin", signin);
router.post("/signup", createUserValidator, validate, signup);

module.exports = router