// src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import {
  getTrialBalance,
  getIncomeStatement,
  getBalanceSheet,
} from "../api/api";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("trial");
  const [trialBalance, setTrialBalance] = useState([]);
  const [incomeStatement, setIncomeStatement] = useState({});
  const [balanceSheet, setBalanceSheet] = useState({});

  useEffect(() => {
    fetchTrialBalance();
    fetchIncomeStatement();
    fetchBalanceSheet();
  }, []);

  const fetchTrialBalance = async () => {
    const data = await getTrialBalance();
    setTrialBalance(data);
  };

  const fetchIncomeStatement = async () => {
    const data = await getIncomeStatement();
    setIncomeStatement(data);
  };

  const fetchBalanceSheet = async () => {
    const data = await getBalanceSheet();
    setBalanceSheet(data);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        📊 التقارير الختامية
      </h1>

      {/* ==== Tabs ==== */}
      <div className="flex justify-center space-x-2 mb-6">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "trial"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("trial")}
        >
          🧾 ميزان المراجعة
        </button>

        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "income"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("income")}
        >
          💰 قائمة الدخل
        </button>

        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "balance"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("balance")}
        >
          ⚖️ الميزانية العمومية
        </button>
      </div>

      {/* ==== محتوى كل تقرير ==== */}
      <div className="border rounded-lg p-4 bg-white shadow">
        {activeTab === "trial" && (
          <div>
            <h2 className="text-xl font-semibold mb-3">🧾 ميزان المراجعة</h2>
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-1 text-left">اسم الحساب</th>
                  <th className="border px-3 py-1 text-right">مدين</th>
                  <th className="border px-3 py-1 text-right">دائن</th>
                </tr>
              </thead>
              <tbody>
                {trialBalance.length > 0 ? (
                  trialBalance.map((row) => (
                    <tr key={row.id}>
                      <td className="border px-3 py-1">{row.name}</td>
                      <td className="border px-3 py-1 text-right text-green-600">
                        {row.debit?.toLocaleString() ?? 0}
                      </td>
                      <td className="border px-3 py-1 text-right text-red-600">
                        {row.credit?.toLocaleString() ?? 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-3 text-gray-500">
                      لا توجد بيانات بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "income" && (
          <div>
            <h2 className="text-xl font-semibold mb-3">💰 قائمة الدخل</h2>
            <div className="space-y-2">
              <p>
                الإيرادات:{" "}
                <span className="text-green-600 font-semibold">
                  {incomeStatement.revenues?.toLocaleString() ?? 0}
                </span>
              </p>
              <p>
                المصروفات:{" "}
                <span className="text-red-600 font-semibold">
                  {incomeStatement.expenses?.toLocaleString() ?? 0}
                </span>
              </p>
              <p>
                صافي الربح:{" "}
                <span className="font-bold">
                  {incomeStatement.net_income?.toLocaleString() ?? 0}
                </span>
              </p>
            </div>
          </div>
        )}

        {activeTab === "balance" && (
          <div>
            <h2 className="text-xl font-semibold mb-3">⚖️ الميزانية العمومية</h2>
            <div className="space-y-2">
              <p>
                🏦 الأصول:{" "}
                <span className="text-green-600 font-semibold">
                  {Math.abs(balanceSheet.assets ?? 0).toLocaleString()}
                </span>
              </p>
              <p>
                💸 الخصوم:{" "}
                <span className="text-red-600 font-semibold">
                  {Math.abs(balanceSheet.liabilities ?? 0).toLocaleString()}
                </span>
              </p>
              <p>
                🧍‍♂️ حقوق الملكية:{" "}
                <span className="font-bold">
                  {Math.abs(balanceSheet.equity ?? 0).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
