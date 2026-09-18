import { useAuth } from "../../context/authContext";

const RoleGate = ({ allow, children }) => {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) return null;
  return children;
};

export default RoleGate;
