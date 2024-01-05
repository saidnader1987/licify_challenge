const express = require("express");
const quotationController = require("./../controllers/quotationController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(authController.restrictTo("admin"), quotationController.getAllQuotations)
  .post(
    authController.restrictTo("proveedor"),
    quotationController.createQuotation
  );

router.route("/:id").get(quotationController.getQuotation);

module.exports = router;
