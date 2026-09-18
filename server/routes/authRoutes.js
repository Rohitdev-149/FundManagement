const express = require("express");
const router = express.Router();
const {
  register,
  login,
  createUser,
  getUsers,
  updateUserRole,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");

router.post("/register", register);
router.post("/login", login);

router.post("/create-user", protect, allowRoles("admin"), createUser);
router.get("/users", protect, allowRoles("admin"), getUsers);
router.put("/users/:id/role", protect, allowRoles("admin"), updateUserRole);

module.exports = router;
