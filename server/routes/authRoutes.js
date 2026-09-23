const express = require("express");
const router = express.Router();
const {
  register,
  login,
  createUser,
  getUsers,
  updateUserRole,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const { validateObjectId } = require("../middleware/objectId");
const {
  validateRequest,
  body,
  objectIdField,
  phoneField,
  requiredText,
  USER_ROLES,
} = require("../middleware/validation");

const registrationValidation = [
  requiredText("name"),
  phoneField(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),
];
const loginValidation = [phoneField(), requiredText("password")];
const userValidation = [
  requiredText("name"),
  phoneField(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),
  body("role").isIn(USER_ROLES).withMessage("role is invalid"),
  body("assignedEventId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("assignedEventId must be a valid ID"),
];
const roleValidation = [
  body("role").isIn(USER_ROLES).withMessage("role is invalid"),
];
const userUpdateValidation = [
  body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage("phone must be a valid international or 10-15 digit number"),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),
  body("role").optional().isIn(USER_ROLES).withMessage("role is invalid"),
  body("assignedEventId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("assignedEventId must be a valid ID"),
];

router.post("/register", registrationValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);

router.post(
  "/create-user",
  protect,
  allowRoles("superadmin", "admin"),
  userValidation,
  validateRequest,
  createUser,
);
router.get("/users", protect, allowRoles("superadmin", "admin"), getUsers);
router.put(
  "/users/:id/role",
  protect,
  validateObjectId(),
  allowRoles("superadmin", "admin"),
  roleValidation,
  validateRequest,
  updateUserRole,
);
router.put(
  "/users/:id",
  protect,
  validateObjectId(),
  allowRoles("superadmin", "admin"),
  userUpdateValidation,
  validateRequest,
  updateUser,
);
router.delete(
  "/users/:id",
  protect,
  validateObjectId(),
  allowRoles("superadmin", "admin"),
  deleteUser,
);

module.exports = router;
