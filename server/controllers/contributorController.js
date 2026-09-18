const Contributor = require("../models/Contributor");
const Contribution = require("../models/Contribution");
const { isMissing, isValidObjectId } = require("../utils/validation");

const normalizeContributorPayload = (body, existingEventId) => {
  const eventId = existingEventId || body.eventId;

  if (isMissing(eventId) || isMissing(body.name)) {
    return { error: "eventId and name are required" };
  }

  if (!isValidObjectId(eventId)) {
    return { error: "Valid eventId is required" };
  }

  return {
    value: {
      eventId,
      name: String(body.name).trim(),
      phone: body.phone ? String(body.phone).trim() : "",
    },
  };
};

// GET /api/contributors?eventId=xxx
exports.getContributors = async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId || !isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Valid eventId is required" });
    }

    const contributors = await Contributor.find({ eventId }).sort({ name: 1 });
    res.json(contributors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/contributors
exports.createContributor = async (req, res) => {
  try {
    const normalized = normalizeContributorPayload(req.body);
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    const contributor = await Contributor.create(normalized.value);
    res.status(201).json(contributor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/contributors/:id
exports.updateContributor = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Valid contributor id is required" });
    }

    const contributor = await Contributor.findById(req.params.id);
    if (!contributor) {
      return res.status(404).json({ message: "Contributor not found" });
    }

    const normalized = normalizeContributorPayload(
      {
        ...contributor.toObject(),
        ...req.body,
        eventId: contributor.eventId.toString(),
      },
      contributor.eventId,
    );
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    Object.assign(contributor, normalized.value);
    await contributor.save();
    res.json(contributor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/contributors/:id
exports.deleteContributor = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Valid contributor id is required" });
    }

    const contributionCount = await Contribution.countDocuments({
      contributorId: req.params.id,
    });
    if (contributionCount > 0) {
      return res.status(409).json({
        message: "Cannot delete a contributor with contribution history",
      });
    }

    const contributor = await Contributor.findByIdAndDelete(req.params.id);
    if (!contributor) {
      return res.status(404).json({ message: "Contributor not found" });
    }
    res.json({ message: "Contributor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/contributors/:id/history
exports.getContributorHistory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Valid contributor id is required" });
    }

    const history = await Contribution.find({
      contributorId: req.params.id,
    }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
