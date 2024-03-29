const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/user.controller");
const validate = require("../../validates/client/user.validate");
const authMiddleware =  require("../../middlewares/client/auth.middleware");
router.get("/register",controller.register);

router.post("/register",validate.registerAccount,controller.registerPatch);

router.get("/login",controller.login);

router.post("/login",validate.loginAccount,controller.loginPatch);

router.get("/logout",controller.logout);

router.get("/password/forgot",controller.forgotPassword);

router.post("/password/forgot",validate.forgotPassword, controller.forgotPasswordPatch);

router.get("/password/otp",controller.otp);

router.post("/password/otp",controller.otpPatch);

router.get("/password/reset",controller.resetPassword);

router.post("/password/reset",validate.resetPass,controller.resetPasswordPatch);

router.get("/info",authMiddleware.requireAuthUser ,controller.info);


const multer = require("multer");
const upload = multer();
const uploadCLoud = require("../../middlewares/admin/uploadImageCloud.middleware");
router.patch("/info/:id",upload.single("avatar"),
uploadCLoud.uploadImageCloudinary ,controller.infoPatch);

module.exports = router;