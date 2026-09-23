const { isValidObjectId, parsePagination } = require("../utils/validation");

const normalizePayload = (body) => {
  return {
    value: {
      name: String(body.name).trim(),
      phone: body.phone ? String(body.phone).trim() : "",
    },
  };
};

exports.getContributors = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error)
      return res.status(400).json({ message: pagination.error });
    res.json(
      await req.eventModels.Contributor.find()
        .sort({ name: 1 })
        .skip(pagination.value.skip)
        .limit(pagination.value.limit),
    );
  } catch (err) {
    console.error("Contributor request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createContributor = async (req, res) => {
  try {
    const normalized = normalizePayload(req.body);
    const duplicate = await req.eventModels.Contributor.exists({
      name: {
        $regex: `^${normalized.value.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
      phone: normalized.value.phone,
    });
    if (duplicate)
      return res.status(409).json({
        message:
          "A contributor with this name and phone already exists in this event",
      });
    res
      .status(201)
      .json(await req.eventModels.Contributor.create(normalized.value));
  } catch (err) {
    console.error("Contributor request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateContributor = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res
        .status(400)
        .json({ message: "Valid contributor id is required" });
    const contributor = await req.eventModels.Contributor.findById(
      req.params.id,
    );
    if (!contributor)
      return res.status(404).json({ message: "Contributor not found" });
    const normalized = normalizePayload({
      ...contributor.toObject(),
      ...req.body,
    });
    if (normalized.error)
      return res.status(400).json({ message: normalized.error });
    Object.assign(contributor, normalized.value);
    await contributor.save();
    res.json(contributor);
  } catch (err) {
    console.error("Contributor request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteContributor = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res
        .status(400)
        .json({ message: "Valid contributor id is required" });
    const contributionCount = await req.eventModels.Contribution.countDocuments(
      {
        contributorId: req.params.id,
      },
    );
    if (contributionCount > 0)
      return res.status(409).json({
        message: `Cannot delete: this contributor has ${contributionCount} contributions on record`,
      });
    const contributor = await req.eventModels.Contributor.findByIdAndDelete(
      req.params.id,
    );
    if (!contributor)
      return res.status(404).json({ message: "Contributor not found" });
    res.status(204).send();
  } catch (err) {
    console.error("Contributor request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getContributorHistory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res
        .status(400)
        .json({ message: "Valid contributor id is required" });
    const pagination = parsePagination(req.query);
    if (pagination.error)
      return res.status(400).json({ message: pagination.error });
    res.json(
      await req.eventModels.Contribution.find({
        contributorId: req.params.id,
      })
        .sort({ date: -1 })
        .skip(pagination.value.skip)
        .limit(pagination.value.limit),
    );
  } catch (err) {
    console.error("Contributor request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
