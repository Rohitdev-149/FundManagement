const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getEventModels } = require("../utils/eventDatabase");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.eventId) {
      const models = await getEventModels(decoded.eventId);
      if (!models)
        return res.status(401).json({ message: "Event no longer exists" });
      req.user = await models.User.findById(decoded.id).select("-passwordHash");
      req.eventModels = models;
    } else {
      req.user = await User.findById(decoded.id).select("-passwordHash");
    }
    if (!req.user)
      return res.status(401).json({ message: "User no longer exists" });
    if (req.user.role !== "superadmin" && !req.user.assignedEventId) {
      return res
        .status(403)
        .json({ message: "No event is assigned to this user" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

module.exports = { protect };
