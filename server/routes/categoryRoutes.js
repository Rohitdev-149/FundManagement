const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const { eventDatabase } = require("../middleware/eventDatabase");
const { validateObjectId } = require("../middleware/objectId");
const {
  validateRequest,
  body,
  nonNegativeAmount,
  requiredText,
  optionalText,
} = require("../middleware/validation");

const categoryValidation = [
  requiredText("name"),
  nonNegativeAmount("budget"),
  optionalText("icon"),
];

router.get("/", protect, eventDatabase, getCategories);
router.post(
  "/",
  protect,
  categoryValidation,
  validateRequest,
  eventDatabase,
  allowRoles("superadmin", "admin", "treasurer"),
  createCategory,
);
router.put(
  "/:id",
  protect,
  validateObjectId(),
  categoryValidation,
  validateRequest,
  eventDatabase,
  allowRoles("superadmin", "admin", "treasurer"),
  updateCategory,
);
router.delete(
  "/:id",
  protect,
  validateObjectId(),
  eventDatabase,
  allowRoles("superadmin", "admin"),
  deleteCategory,
);

module.exports = router;
