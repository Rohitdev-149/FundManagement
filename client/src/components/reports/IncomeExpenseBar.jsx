import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/format";

const IncomeExpenseBar = ({ totalCollection, totalExpense }) => {
  const data = [
    { name: "Collection", value: totalCollection },
    { name: "Expense", value: totalExpense },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          <Cell fill="#22c55e" />
          <Cell fill="#ef4444" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseBar;
