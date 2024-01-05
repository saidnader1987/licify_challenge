const express = require("express");
const projectController = require("./../controllers/projectController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.use(authController.protect);
router
  .route("/")
  .get(
    authController.restrictTo("admin", "proveedor"),
    projectController.getAllProjects
  )
  .post(
    authController.restrictTo("constructor"),
    projectController.uploadProjectImages,
    projectController.resizeProjectImages,
    projectController.createProject
  );

router
  .route("/:projectId/quotations")
  .get(
    authController.restrictTo("admin", "constructor"),
    projectController.getProjectQuotations
  );

router
  .route("/:projectId/users/:userId/quotations")
  .get(projectController.getProjectSupplierQuotation);

router.route("/:id").get(projectController.getProject);

module.exports = router;
