import React, { useEffect, useState } from "react";
import { getJournalEntries, getTransactionLines, getAccounts, createAdjustJournal } from "../api/api";

export default function JournalEntries() {
  const [entries, setEntries] = useState([]);
  const [lines, setLines] = useState([]);
  const [accounts, setAccounts] = useState({});
  const [adjustData, setAdjustData] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    lines: [{ account_id: "", debit: 0, credit: 0 }]
  });

  useEffect(() => {
    async function fetchData() {
      const journalData = await getJournalEntries();
      const linesData = await getTransactionLines();
      const accountsData = await getAccounts();

      const accountsDict = {};
      accountsData.forEach(acc => { accountsDict[acc.id] = acc.name; });

      // ترتيب القيود تنازلياً حسب رقم القيد
      const sortedJournalData = journalData.sort((a, b) => b.id - a.id);

      setEntries(sortedJournalData);
      setLines(linesData);
      setAccounts(accountsDict);
    }
    fetchData();
  }, []);

  const handleLineChange = (index, field, value) => {
    const newLines = [...adjustData.lines];
    newLines[index][field] = value;
    setAdjustData({ ...adjustData, lines: newLines });
  };

  const addLine = () => {
    setAdjustData({ ...adjustData, lines: [...adjustData.lines, { account_id: "", debit: 0, credit: 0 }] });
  };

  const removeLine = index => {
    const newLines = [...adjustData.lines];
    newLines.splice(index, 1);
    setAdjustData({ ...adjustData, lines: newLines });
  };

  const submitAdjust = async () => {
    if (!adjustData.description) return alert("ادخل وصف القيد");

    const payload = {
      date: adjustData.date,
      description: adjustData.description,
      lines: adjustData.lines.map(l => ({
        account_id: parseInt(l.account_id),
        debit: parseFloat(l.debit),
        credit: parseFloat(l.credit)
      }))
    };

    try {
      await createAdjustJournal(payload);
      alert("تم إنشاء القيد بنجاح");
      const [journalData, linesData] = await Promise.all([getJournalEntries(), getTransactionLines()]);
      const sortedJournalData = journalData.sort((a, b) => b.id - a.id); // ترتيب تنازلي
      setEntries(sortedJournalData);
      setLines(linesData);
      setAdjustData({ date: new Date().toISOString().slice(0,10), description: "", lines: [{ account_id: "", debit: 0, credit: 0 }] });
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إنشاء القيد");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">قيود اليومية</h1>

      <div className="border rounded p-4 mb-6 bg-gray-50 shadow-sm">
        <h2 className="font-bold mb-2">إضافة قيد تعديل / رصيد ابتدائي</h2>
        <div className="mb-2">
          <label className="block mb-1">التاريخ:</label>
          <input type="date" value={adjustData.date} onChange={e => setAdjustData({ ...adjustData, date: e.target.value })} className="border px-2 py-1 w-full" />
        </div>
        <div className="mb-2">
          <label className="block mb-1">الوصف:</label>
          <input type="text" value={adjustData.description} onChange={e => setAdjustData({ ...adjustData, description: e.target.value })} className="border px-2 py-1 w-full" />
        </div>

        {adjustData.lines.map((line, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select value={line.account_id} onChange={e => handleLineChange(index, "account_id", e.target.value)} className="border px-2 py-1 flex-1">
              <option value="">اختر الحساب</option>
              {Object.entries(accounts).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
            <input type="number" placeholder="مدين" value={line.debit} onChange={e => handleLineChange(index, "debit", e.target.value)} className="border px-2 py-1 w-24" />
            <input type="number" placeholder="دائن" value={line.credit} onChange={e => handleLineChange(index, "credit", e.target.value)} className="border px-2 py-1 w-24" />
            <button onClick={() => removeLine(index)} className="bg-red-500 text-white px-2 rounded">حذف</button>
          </div>
        ))}

        <button onClick={addLine} className="bg-blue-500 text-white px-4 py-1 rounded mb-2">إضافة سطر</button>
        <br/>
        <button onClick={submitAdjust} className="bg-green-500 text-white px-4 py-2 rounded">حفظ القيد</button>
      </div>

      {entries.map(entry => (
        <div key={entry.id} className="border rounded p-4 mb-4 bg-white shadow-sm">
          <div className="mb-2">
            <strong>رقم القيد:</strong> {entry.id} | 
            <strong> التاريخ:</strong> {entry.date} | 
            <strong> الوصف:</strong> {entry.description || "-"}
          </div>

          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">الحساب</th>
                <th className="border px-2 py-1">مدين</th>
                <th className="border px-2 py-1">دائن</th>
              </tr>
            </thead>
            <tbody>
              {lines.filter(line => line.journal_entry_id === entry.id).map(line => (
                <tr key={line.id}>
                  <td className="border px-2 py-1">{line.account_name || "غير محدد"}</td>
                  <td className="border px-2 py-1">{line.debit}</td>
                  <td className="border px-2 py-1">{line.credit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
