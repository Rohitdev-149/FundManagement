import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/format";

const BudgetVsActualChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        No categories yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 50)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 10 }} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          width={90}
        />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend />
        <Bar
          dataKey="budget"
          fill="#94a3b8"
          name="Budget"
          radius={[0, 4, 4, 0]}
        />
        <Bar
          dataKey="spent"
          fill="#f97316"
          name="Spent"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BudgetVsActualChart;
