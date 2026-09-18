const Event = require("../models/Event");
const {
  isMissing,
  isValidObjectId,
  parseNumber,
} = require("../utils/validation");

const normalizeEventPayload = (body) => {
  const totalBudget = isMissing(body.totalBudget)
    ? 0
    : parseNumber(body.totalBudget);

  if (isMissing(body.name) || isMissing(body.startDate)) {
    return { error: "name and startDate are required" };
  }

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
    const events = await Event.find().sort({ startDate: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/events   (admin only)
exports.createEvent = async (req, res) => {
  try {
    const normalized = normalizeEventPayload(req.body);
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    const event = await Event.create({
      ...normalized.value,
      createdBy: req.user._id,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
};
