const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");

router.get("/", protect, getCategories);
router.post("/", protect, allowRoles("admin", "treasurer"), createCategory);
router.put("/:id", protect, allowRoles("admin", "treasurer"), updateCategory);

module.exports = router;
