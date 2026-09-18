import { Link } from "react-router-dom";

const items = [
  { path: "/categories", label: "Categories & Budgets", icon: "\u{1F3F7}" },
  { path: "/pending", label: "Pending Contributions", icon: "\u{23F3}" },
  { path: "/settings", label: "Settings", icon: "\u{2699}" },
];

const More = () => (
  <div className="page-shell">
    <h1 className="page-title mb-1">More</h1>
    <p className="page-subtitle mb-4">Manage supporting event details.</p>
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="list-card flex min-h-16 items-center gap-3 active:bg-gray-50"
        >
          <span className="text-xl">{item.icon}</span>
          <span className="font-medium text-sm">{item.label}</span>
        </Link>
      ))}
    </div>
  </div>
);

export default More;
