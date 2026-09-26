import { useState, useEffect } from "react";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  updateUserRole,
} from "../../api/userApi";
import { useAuth } from "../../context/authContext";
import { useEvent } from "../../context/eventContext";

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { events } = useEvent();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [assignedEventId, setAssignedEventId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name,
        phone,
        ...(editingUser?.role === "superadmin" ? {} : { role }),
        ...(password ? { password } : {}),
        ...(currentUser.role === "superadmin" && { assignedEventId }),
      };
      if (editingUser) {
        await updateUser(editingUser._id, payload);
      } else {
        await createUser({ ...payload, password });
      }
      setName("");
      setPhone("");
      setPassword("");
      setRole("viewer");
      setAssignedEventId("");
      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      const validationMessage = err.response?.data?.errors
        ?.map((item) => item.message)
        .join(", ");
      setError(
        validationMessage ||
          err.response?.data?.message ||
          (editingUser ? "Failed to update user" : "Failed to create user"),
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (managedUser) => {
    setEditingUser(managedUser);
    setName(managedUser.name);
    setPhone(managedUser.phone);
    setPassword("");
    setRole(managedUser.role);
    setAssignedEventId(managedUser.assignedEventId || "");
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (managedUser) => {
    if (managedUser._id === currentUser._id) return;
    if (!window.confirm(`Delete ${managedUser.name}'s account?`)) return;
    try {
      await deleteUser(managedUser._id);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-sm">Manage Users</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg"
          >
            + Add User
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="space-y-2 mb-4 border rounded-lg p-3"
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder={
              editingUser ? "New password (optional)" : "Set a password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editingUser}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={editingUser?.role === "superadmin"}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="viewer">Viewer — can only look</option>
            <option value="treasurer">
              Treasurer — can add/edit money records
            </option>
            <option value="admin">Admin — full access</option>
          </select>
          {currentUser.role === "superadmin" && (
            <select
              value={assignedEventId}
              onChange={(e) => setAssignedEventId(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select assigned event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          )}
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingUser
                  ? "Save Changes"
                  : "Create User"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 border rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading users...</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u._id}
              className="flex justify-between items-center border-b pb-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-gray-500">{u.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  disabled={u._id === currentUser._id}
                  className="text-xs border rounded-lg px-2 py-1 capitalize disabled:bg-gray-100"
                >
                  <option value="viewer">Viewer</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="button"
                  onClick={() => startEditing(u)}
                  className="text-xs font-semibold text-orange-600 hover:underline"
                >
                  Edit
                </button>
                {u._id !== currentUser._id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(u)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default UserManagement;
