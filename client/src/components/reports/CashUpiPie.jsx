import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/format";

const CashUpiPie = ({ cashInHand, upiBankBalance }) => {
  const data = [
    { name: "Cash", value: Math.max(Number(cashInHand) || 0, 0) },
    { name: "UPI/Bank", value: Math.max(Number(upiBankBalance) || 0, 0) },
  ];

  if (data[0].value === 0 && data[1].value === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">No balance yet.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          <Cell fill="#f97316" />
          <Cell fill="#3b82f6" />
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CashUpiPie;
