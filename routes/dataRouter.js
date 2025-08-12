const express = require("express");
const router = express.Router();

const {
  handleAdhar,
  generateAadhaarOtp,
  verifyAadhaarOtp,
  generatePanOtp,
  verifyPanOtp,
  handlePanUnique,
  handleAadhaarUnique,
} = require("../controller/adharController.js");
router.route("/").post(handleAdhar).get((req, res) => {
 res.status(200).json({
      message: "You have reached the data Route",
    });
});
router.route("/generateOtp").post(generateAadhaarOtp);
router.route("/verifyOtp").post(verifyAadhaarOtp);
router.post("/generatePanOtp", generatePanOtp);
router.post("/verifyPanOtp", verifyPanOtp);

module.exports = router;
