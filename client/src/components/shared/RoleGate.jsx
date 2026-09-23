import { useAuth } from "../../context/authContext";

const RoleGate = ({ allow, children }) => {
  const { user } = useAuth();
  if (!user || (user.role !== "superadmin" && !allow.includes(user.role))) {
    return null;
  }
  return children;
};

export default RoleGate;
