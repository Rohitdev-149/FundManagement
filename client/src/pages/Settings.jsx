import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useEvent } from "../context/eventContext";
import { getEvents } from "../api/eventApi";
import EventSettingsForm from "../components/shared/EventSettingsForm";
import RoleGate from "../components/shared/RoleGate";
import UserManagement from "../components/shared/UserManagement";
const Settings = () => {
  const { user, logout } = useAuth();
  const { events, currentEvent, selectEvent, setEvents } = useEvent();
  const [formMode, setFormMode] = useState(null); // null | 'create' | 'edit'

  const refreshEvents = async () => {
    const { data } = await getEvents();
    setEvents(data);
    // Keep the same event selected after an edit; select the newest after a create
    if (formMode === "create") {
      selectEvent(data[0]);
    } else {
      const stillExists = data.find((e) => e._id === currentEvent._id);
      if (stillExists) selectEvent(stillExists);
    }
    setFormMode(null);
  };

  return (
    <div className="p-4 pb-20 max-w-2xl mx-auto space-y-6">
      <h1 className="text-lg font-bold text-orange-600">Settings</h1>

      {/* Profile */}
      <section className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold text-sm mb-3">Your Account</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <span className="text-gray-500">Name:</span> {user?.name}
          </p>
          <p>
            <span className="text-gray-500">Role:</span>{" "}
            <span className="capitalize">{user?.role}</span>
          </p>
        </div>
        <button
          onClick={logout}
          className="mt-4 w-full border border-red-500 text-red-600 rounded-lg py-2 text-sm font-semibold"
        >
          Logout
        </button>
      </section>

      {/* Event switcher — visible to everyone */}
      <section className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold text-sm mb-3">Current Event</h2>
        <select
          value={currentEvent?._id || ""}
          onChange={(e) =>
            selectEvent(events.find((ev) => ev._id === e.target.value))
          }
          className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
        >
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.name}
            </option>
          ))}
        </select>

        <RoleGate allow={["admin"]}>
          <div className="flex gap-2">
            <button
              onClick={() => setFormMode("edit")}
              className="flex-1 border border-orange-600 text-orange-600 rounded-lg py-2 text-sm font-semibold"
            >
              Edit This Event
            </button>
            <button
              onClick={() => setFormMode("create")}
              className="flex-1 bg-orange-600 text-white rounded-lg py-2 text-sm font-semibold"
            >
              + New Event
            </button>
          </div>
        </RoleGate>
      </section>

      <RoleGate allow={["admin"]}>
        <UserManagement />
      </RoleGate>

      {formMode && (
        <EventSettingsForm
          mode={formMode}
          existingEvent={formMode === "edit" ? currentEvent : null}
          onSaved={refreshEvents}
          onCancel={() => setFormMode(null)}
        />
      )}

      {/* App info */}
      <section className="bg-white rounded-xl shadow-sm p-4 text-center text-xs text-gray-400">
        Ganpati Mandal Fund Manager
      </section>
    </div>
  );
};

export default Settings;
