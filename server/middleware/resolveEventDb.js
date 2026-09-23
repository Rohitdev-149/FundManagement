const { getEventModels } = require("../utils/eventDatabase");

const resolveEventDb = async (req, res, next) => {
  let eventId = req.params.eventId || req.query.eventId || req.body?.eventId;

  // Event-scoped roles can ONLY ever use their own assigned event — server enforces this,
  // ignoring whatever eventId the client sent
  if (req.user.role !== "superadmin") {
    eventId = req.user.assignedEventId;
  }

  if (!eventId) {
    return res
      .status(403)
      .json({ message: "No event is assigned to this user" });
  }

  try {
    const models = await getEventModels(eventId);
    if (!models) return res.status(404).json({ message: "Event not found" });
    req.eventId = eventId.toString();
    req.eventModels = models;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { resolveEventDb };
