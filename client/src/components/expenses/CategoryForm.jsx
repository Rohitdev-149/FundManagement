import { useState, useEffect } from "react";
import { createCategory, updateCategory } from "../../api/categoryApi";

const PRESET_ICONS = [
  "\u{1F6D5}",
  "\u{1F3A8}",
  "\u{1F50A}",
  "\u{1F4A1}",
  "\u{1F4E6}",
  "\u{1F69A}",
  "\u{26A1}",
  "\u{1F477}",
  "\u{1F37D}",
  "\u{1F338}",
  "\u{1F9F9}",
  "\u{1F3A4}",
];

const CategoryForm = ({ eventId, editingCategory, onSaved, onCancel }) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("\u{1F4E6}");
  const [budget, setBudget] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || "");
      setIcon(editingCategory.icon || "\u{1F4E6}");
      setBudget(String(editingCategory.budget ?? ""));
    }
  }, [editingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const parsedBudget = budget === "" ? 0 : Number(budget);
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
      setError("Budget must be zero or more");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        eventId,
        name: name.trim(),
        icon,
        budget: parsedBudget,
      };
      if (editingCategory) {
        await updateCategory(editingCategory._id, payload);
      } else {
        await createCategory(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="form-card space-y-3"
    >
      <label className="block text-sm font-medium text-gray-700">Icon</label>
      <div className="flex flex-wrap gap-2">
        {PRESET_ICONS.map((presetIcon) => (
          <button
            type="button"
            key={presetIcon}
            onClick={() => setIcon(presetIcon)}
            className={`text-xl w-10 h-10 rounded-lg border flex items-center justify-center ${
              icon === presetIcon
                ? "border-orange-600 bg-orange-50"
                : "border-gray-200"
            }`}
          >
            {presetIcon}
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium text-gray-700">
        Category Name
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="e.g. Decoration, or your own custom name"
        className="text-input"
      />

      <label className="block text-sm font-medium text-gray-700">
        Planned Budget (Rs.)
      </label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        placeholder="0"
        className="text-input"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="primary-action flex-1"
        >
          {saving ? "Saving..." : editingCategory ? "Update" : "Add Category"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="secondary-action"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default CategoryForm;
