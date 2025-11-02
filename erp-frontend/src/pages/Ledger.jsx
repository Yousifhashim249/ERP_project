// src/pages/Ledger.jsx
import React, { useEffect, useState } from "react";
import { getTransactionLinesWithVendor, getAccounts, getVendors } from "../api/api";

export default function Ledger() {
  const [ledger, setLedger] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filteredLedger, setFilteredLedger] = useState([]);

  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchLedger();
    fetchAccounts();
    fetchVendors();
  }, []);

  const fetchLedger = async () => {
    const data = await getTransactionLinesWithVendor();
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    setLedger(data);
    setFilteredLedger(data);
  };

  const fetchAccounts = async () => {
    const data = await getAccounts();
    setAccounts(data);
  };

  const fetchVendors = async () => {
    const res = await getVendors();
    setVendors(res);
  };

  const getVendorName = (line) => line.vendor_name || "—";

  useEffect(() => {
    let filtered = ledger;

    if (selectedAccount)
      filtered = filtered.filter((l) => l.account_name === selectedAccount);

    if (selectedVendor)
      filtered = filtered.filter((l) => getVendorName(l) === selectedVendor);

    if (searchText) {
      const text = searchText.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          (l.entry_desc || "").toLowerCase().includes(text) ||
          (l.account_name || "").toLowerCase().includes(text) ||
          (getVendorName(l) || "").toLowerCase().includes(text)
      );
    }

    if (dateFrom)
      filtered = filtered.filter((l) => new Date(l.date) >= new Date(dateFrom));
    if (dateTo)
      filtered = filtered.filter((l) => new Date(l.date) <= new Date(dateTo));

    const balances = {};
    filtered.forEach((line) => {
      const key = line.account_name || "general";
      if (!balances[key]) balances[key] = 0;
      balances[key] += (line.debit || 0) - (line.credit || 0);
      line.balance = balances[key];
    });

    setFilteredLedger(filtered);
  }, [selectedAccount, selectedVendor, ledger, searchText, dateFrom, dateTo]);

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-center mb-4">📚 دفتر الأستاذ العام</h2>

      <div className="flex flex-col md:flex-row gap-3 items-center mb-4 flex-wrap">
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="border p-2 rounded shadow-sm w-64"
        >
          <option value="">كل الحسابات</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.name}>{a.name}</option>
          ))}
        </select>

        <select
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
          className="border p-2 rounded shadow-sm w-64"
        >
          <option value="">كل الموردين</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.name}>{v.name}</option>
          ))}
        </select>

        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border p-2 rounded shadow-sm" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border p-2 rounded shadow-sm" />

        <input
          type="text"
          placeholder="بحث..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded shadow-sm flex-1 min-w-[200px]"
        />
      </div>

      <div className="border rounded-lg bg-white shadow overflow-x-auto">
        <table className="min-w-full border table-auto">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border px-3 py-1 text-left">رقم القيد</th>
              <th className="border px-3 py-1 text-left">التاريخ</th>
              <th className="border px-3 py-1 text-left">الوصف</th>
              <th className="border px-3 py-1 text-left">اسم الحساب</th>
              <th className="border px-3 py-1 text-left">اسم المورد</th>
              <th className="border px-3 py-1 text-right">مدين</th>
              <th className="border px-3 py-1 text-right">دائن</th>
              <th className="border px-3 py-1 text-right">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedger.length > 0 ? (
              filteredLedger.map((line) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-1">{line.journal_entry_id}</td>
                  <td className="border px-3 py-1">{line.date ? new Date(line.date).toLocaleDateString() : "-"}</td>
                  <td className="border px-3 py-1">{line.entry_desc || "-"}</td>
                  <td className="border px-3 py-1 text-blue-700 font-semibold">{line.account_name || "—"}</td>
                  <td className="border px-3 py-1">{getVendorName(line)}</td>
                  <td className="border px-3 py-1 text-right text-green-600">{line.debit?.toLocaleString() ?? 0}</td>
                  <td className="border px-3 py-1 text-right text-red-600">{line.credit?.toLocaleString() ?? 0}</td>
                  <td
                    className={`border px-3 py-1 text-right font-semibold ${
                      line.balance >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {line.balance?.toLocaleString() ?? 0}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-3 text-gray-500">لا توجد بيانات مطابقة</td>
              </tr>
            )}

            {filteredLedger.length > 0 && (
              <tr className="bg-gray-100 font-semibold">
                <td colSpan="5" className="border px-3 py-1 text-right">الإجمالي:</td>
                <td className="border px-3 py-1 text-right text-green-700">
                  {filteredLedger.reduce((sum, l) => sum + (l.debit || 0), 0).toLocaleString()}
                </td>
                <td className="border px-3 py-1 text-right text-red-700">
                  {filteredLedger.reduce((sum, l) => sum + (l.credit || 0), 0).toLocaleString()}
                </td>
                <td className="border px-3 py-1 text-right font-bold">
                  {filteredLedger[filteredLedger.length - 1].balance?.toLocaleString() ?? 0}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
