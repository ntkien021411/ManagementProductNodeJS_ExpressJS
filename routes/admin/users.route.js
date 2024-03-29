const express = require("express");
const router = express.Router();

//Nhúng multer để upload ảnh ở trên máy tính cá nhân
const multer = require("multer");
const upload = multer();
const uploadCLoud = require("../../middlewares/admin/uploadImageCloud.middleware");
const controller = require("../../controllers/admin/user.controller");
router.get("/", controller.index);

router.get("/create", controller.createAccountsPage);

const validate = require("../../validates/admin/account.validate");
router.post("/create", upload.single("avatar"),
uploadCLoud.uploadImageCloudinary,
validate.createAccount,
controller.createAccounts);

router.get("/edit/:id", controller.editAccountPage);

router.patch(
  "/edit/:id",
  upload.single("avatar"),
uploadCLoud.uploadImageCloudinary,
  validate.editAccount,
  controller.editAccount
);

router.get("/detail/:id", controller.detail);

router.delete("/delete/:id", controller.deleteAccount);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);


module.exports = router;