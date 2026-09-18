import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/format";

const mergeByDate = (contributionsByDate, expensesByDate) => {
  const map = {};
  contributionsByDate.forEach((c) => {
    map[c._id] = { date: c._id, collection: c.total, expense: 0 };
  });
  expensesByDate.forEach((e) => {
    if (map[e._id]) {
      map[e._id].expense = e.total;
    } else {
      map[e._id] = { date: e._id, collection: 0, expense: e.total };
    }
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
};

const DateTrendChart = ({ contributionsByDate, expensesByDate }) => {
  const data = mergeByDate(contributionsByDate || [], expensesByDate || []);

  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">No data yet.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend />
        <Line
          type="monotone"
          dataKey="collection"
          stroke="#22c55e"
          name="Collection"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          name="Expense"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DateTrendChart;
