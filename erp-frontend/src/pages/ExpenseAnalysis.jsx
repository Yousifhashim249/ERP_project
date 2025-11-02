import React, { useEffect, useState } from "react";
import { getExpenseAnalysis } from "../api/api";
import { Card, CardContent } from "../components/ui/card";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ExpenseAnalysis() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#d84315", "#7b1fa2"];

  useEffect(() => {
    // جلب بيانات تحليل المصروفات من الـ API
    getExpenseAnalysis()
      .then(setData)
      .catch((err) => {
        console.error("خطأ أثناء جلب البيانات:", err);
        setError("حدث خطأ أثناء تحميل البيانات.");
      });
  }, []);

  // حالة التحميل أو الخطأ
  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!data)
    return <p className="text-center text-gray-500 mt-10">جارِ تحميل تحليل المصروفات...</p>;

  const { total_expenses, by_account } = data;

  // تجهيز بيانات الرسم البياني الشهري
  const monthlyData = {};
  Object.keys(by_account).forEach((acc) => {
    by_account[acc].forEach((item) => {
      if (!monthlyData[item.month]) monthlyData[item.month] = { month: item.month };
      monthlyData[item.month][acc] = item.amount;
    });
  });
  const chartData = Object.values(monthlyData);

  // تجهيز بيانات المخطط الدائري
  const pieData = Object.entries(by_account).map(([acc, vals]) => ({
    name: acc,
    value: vals.reduce((sum, v) => sum + v.amount, 0),
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">📊 تحليل المصروفات</h1>

      {/* بطاقة إجمالي المصروفات */}
      <Card className="shadow-md">
        <CardContent className="text-center py-6">
          <h2 className="text-lg font-semibold text-gray-700">إجمالي المصروفات</h2>
          <p className="text-3xl font-bold text-red-500 mt-2">
            {total_expenses?.toLocaleString()} ج.س
          </p>
        </CardContent>
      </Card>

      {/* الاتجاه الشهري للمصروفات */}
      <Card className="shadow-md">
        <CardContent>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            اتجاه المصروفات الشهرية
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(by_account).map((acc, i) => (
                <Line
                  key={acc}
                  type="monotone"
                  dataKey={acc}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* توزيع المصروفات حسب البند */}
      <Card className="shadow-md">
        <CardContent>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            نسبة المصروفات حسب البند
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
