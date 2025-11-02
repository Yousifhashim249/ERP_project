// src/pages/AccountsSection.jsx
import React, { useState } from "react";
import Accounts from "./Accounts";
import JournalEntries from "./JournalEntries";
import Payments from "./Payments.jsx";
import Reports from "./Reports.jsx";
import Ledger from "./Ledger.jsx"; // ✅ أضف هذا السطر

export default function AccountsSection() {
  const [activeTab, setActiveTab] = useState("accounts");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">قسم المحاسبة</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-2">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "accounts"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("accounts")}
        >
          دليل الحسابات
        </button>

        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "journal"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("journal")}
        >
          قيود اليومية
        </button>

        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "payments"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("payments")}
        >
          المدفوعات
        </button>

        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "ledger"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("ledger")}
        >
          📚 دفتر الأستاذ
        </button>

        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "reports"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("reports")}
        >
          📊 التقارير الختامية
        </button>
      </div>

      {/* Content */}
      <div className="border rounded-lg p-4 bg-white shadow">
        {activeTab === "accounts" && <Accounts />}
        {activeTab === "journal" && <JournalEntries />}
        {activeTab === "payments" && <Payments />}
        {activeTab === "ledger" && <Ledger />} {/* ✅ تمت الإضافة هنا */}
        {activeTab === "reports" && <Reports />}
      </div>
    </div>
  );
}
