import { useState } from "react";
import { loginUser } from "../api/authApi";
import { AuthContext } from "./authContext";

const readStoredUser = () => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (phone, password) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await loginUser({ phone, password });
      const loggedInUser = {
        _id: data._id,
        name: data.name,
        role: data.role,
        assignedEventId: data.assignedEventId || null,
      };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
