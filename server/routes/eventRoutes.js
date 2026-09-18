const express = require("express");
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
} = require("../controllers/eventController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");

router.get("/", protect, getEvents);
router.post("/", protect, allowRoles("admin"), createEvent);
router.put("/:id", protect, allowRoles("admin"), updateEvent);

module.exports = router;
