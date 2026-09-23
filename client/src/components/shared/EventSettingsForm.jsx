import { useState, useEffect } from "react";
import { createEvent, updateEvent } from "../../api/eventApi";

const EventSettingsForm = ({ mode, existingEvent, onSaved, onCancel }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (mode === "edit" && existingEvent) {
      setName(existingEvent.name);
      setStartDate(existingEvent.startDate?.slice(0, 10));
      setEndDate(existingEvent.endDate?.slice(0, 10) || "");
      setTotalBudget(existingEvent.totalBudget || "");
    }
  }, [mode, existingEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors([]);
    setSaving(true);
    try {
      const payload = {
        name,
        startDate,
        endDate: endDate || undefined,
        totalBudget: Number(totalBudget) || 0,
      };
      if (mode === "edit") {
        await updateEvent(existingEvent._id, payload);
      } else {
        await createEvent(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save event");
      setValidationErrors(err.response?.data?.errors || []);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm p-4 space-y-3"
    >
      <label className="block text-sm font-medium text-gray-700">
        Event Name
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Ganpati 2027"
        required
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <label className="block text-sm font-medium text-gray-700">
        Start Date
      </label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <label className="block text-sm font-medium text-gray-700">
        End Date (optional)
      </label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <label className="block text-sm font-medium text-gray-700">
        Overall Budget (₹, optional)
      </label>
      <input
        type="number"
        value={totalBudget}
        onChange={(e) => setTotalBudget(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {validationErrors.length > 0 && (
        <ul className="text-red-500 text-sm list-disc pl-5">
          {validationErrors.map((item, index) => (
            <li key={`${item.field}-${index}`}>
              {item.field}: {item.message}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-orange-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : mode === "edit"
              ? "Update Event"
              : "Create Event"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 border rounded-lg text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default EventSettingsForm;
