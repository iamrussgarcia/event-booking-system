const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { verify } = require("../auth");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/logout", verify, userController.logoutUser);
router.get("/profile", verify, userController.getProfile);
router.patch("/profile", verify, userController.updateProfile);
router.patch("/password", verify, userController.updatePassword);

module.exports = router;