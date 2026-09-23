const Event = require("../models/Event");
const {
  databaseNameFromEventName,
  ensureEventDatabase,
} = require("../utils/eventDatabase");
const {
  isMissing,
  isValidObjectId,
  parseNumber,
} = require("../utils/validation");

const normalizeEventPayload = (body) => {
  const totalBudget = isMissing(body.totalBudget)
    ? 0
    : parseNumber(body.totalBudget);

  if (!Number.isFinite(totalBudget) || totalBudget < 0) {
    return { error: "Total budget must be zero or more" };
  }

  const startDate = new Date(body.startDate);
  if (Number.isNaN(startDate.getTime())) {
    return { error: "Valid startDate is required" };
  }

  const endDate = body.endDate ? new Date(body.endDate) : undefined;
  if (body.endDate && Number.isNaN(endDate.getTime())) {
    return { error: "Valid endDate is required" };
  }

  if (endDate && endDate < startDate) {
    return { error: "endDate cannot be before startDate" };
  }

  return {
    value: {
      name: String(body.name).trim(),
      startDate,
      endDate,
      totalBudget,
    },
  };
};

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const filter =
      req.user.role === "superadmin" ? {} : { _id: req.user.assignedEventId };
    const events = await Event.find(filter).sort({ startDate: -1 });
    res.json(events);
  } catch (err) {
    console.error("Event request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/events   (admin only)
exports.createEvent = async (req, res) => {
  try {
    const normalized = normalizeEventPayload(req.body);
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    const baseDbName = databaseNameFromEventName(normalized.value.name);
    let dbName = baseDbName;
    let suffix = 2;
    while (
      await Event.exists({
        $or: [{ dbName }, { databaseName: dbName }],
      })
    ) {
      dbName = `${baseDbName}_${suffix}`;
      suffix += 1;
    }
    const event = await Event.create({
      ...normalized.value,
      dbName,
      createdBy: req.user._id,
    });
    try {
      await ensureEventDatabase(event);
    } catch (provisionError) {
      await Event.deleteOne({ _id: event._id });
      throw provisionError;
    }
    res.status(201).json(event);
  } catch (err) {
    console.error("Event request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/events/:id   (admin only)
exports.updateEvent = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Valid event id is required" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (
      req.user.role !== "superadmin" &&
      event._id.toString() !== req.user.assignedEventId.toString()
    ) {
      return res.status(403).json({ message: "Not permitted for this event" });
    }

    const normalized = normalizeEventPayload({
      ...event.toObject(),
      ...req.body,
    });
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    Object.assign(event, normalized.value);
    await event.save();
    res.json(event);
  } catch (err) {
    console.error("Event request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
