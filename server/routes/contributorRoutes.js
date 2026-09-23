const express = require("express");
const router = express.Router();
const {
  getContributors,
  createContributor,
  updateContributor,
  deleteContributor,
  getContributorHistory,
} = require("../controllers/contributorController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const { eventDatabase } = require("../middleware/eventDatabase");
const { validateObjectId } = require("../middleware/objectId");
const {
  validateRequest,
  body,
  optionalText,
  phoneField,
  requiredText,
} = require("../middleware/validation");

const contributorValidation = [
  requiredText("name"),
  body("phone")
    .optional({ nullable: true })
    .customSanitizer((value) => String(value).trim()),
  body("phone")
    .optional({ nullable: true })
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage("phone must be a valid international or 10-15 digit number"),
];

router.get("/", protect, eventDatabase, getContributors);
router.post(
  "/",
  protect,
  contributorValidation,
  validateRequest,
  eventDatabase,
  allowRoles("superadmin", "admin", "treasurer"),
  createContributor,
);
router.put(
  "/:id",
  protect,
  validateObjectId(),
  contributorValidation,
  validateRequest,
  eventDatabase,
  allowRoles("superadmin", "admin", "treasurer"),
  updateContributor,
);
router.delete(
  "/:id",
  protect,
  validateObjectId(),
  eventDatabase,
  allowRoles("superadmin", "admin"),
  deleteContributor,
);
router.get(
  "/:id/history",
  protect,
  validateObjectId(),
  eventDatabase,
  getContributorHistory,
);

module.exports = router;
