import { formatCurrency } from "../../utils/format";

const SummaryCard = ({ label, value, tone = "default" }) => {
  const toneClasses = {
    default: "text-gray-900",
    positive: "text-green-600",
    negative: "text-red-600",
  };

  return (
    <div className="card min-w-0">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold leading-tight ${toneClasses[tone]}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
};

export default SummaryCard;
