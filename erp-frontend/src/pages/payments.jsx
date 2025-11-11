import React, { useEffect, useState } from "react";
import {
  getPayments,
  createPayment,
  getVendors,
  getAccounts,
  updatePayment,
  deletePayment,
  createDailyExpense,
  deleteDailyExpense,
  getDailyExpenses
} from "../api/api.js";

export default function Payments() {
  const [activeTab, setActiveTab] = useState("payments"); // التاب النشط
  const [payments, setPayments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [newPayment, setNewPayment] = useState({
    vendor_id: "",
    account_id: "",
    date: "",
    amount: "",
    reference: ""
  });

  // --- بيانات المصروفات اليومية / الرواتب ---
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [dailyAmount, setDailyAmount] = useState("");
  const [dailyDescription, setDailyDescription] = useState("");
  const [dailyExpenseAccountId, setDailyExpenseAccountId] = useState("");
  const [dailyCreditAccountId, setDailyCreditAccountId] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchDailyExpenses(); // جلب المصروفات اليومية عند التحميل
  }, []);

  async function fetchData() {
    setLoading(true);
    const v = await getVendors();
    const a = await getAccounts();
    const p = await getPayments();
    setVendors(v);
    setAccounts(a);
    setPayments(p);
    setLoading(false);
  }

  async function fetchDailyExpenses() {
    const res = await getDailyExpenses();
    setDailyExpenses(res);
  }

  // ------------------- وظائف المدفوعات العادية -------------------
  async function handleCreatePayment() {
    if (!newPayment.vendor_id || !newPayment.account_id || !newPayment.date || !newPayment.amount) {
      return alert("الرجاء إدخال جميع الحقول");
    }

    const createdPayment = await createPayment(newPayment);
    setPayments(prev => [...prev, createdPayment]);
    setNewPayment({ vendor_id: "", account_id: "", date: "", amount: "", reference: "" });
  }

  async function handleDeletePayment(id) {
    if (!confirm("هل أنت متأكد من حذف هذه الدفعة؟")) return;
    await deletePayment(id);
    setPayments(prev => prev.filter(p => p.id !== id));
  }

  async function handleEditPayment(payment) {
    const newAmount = prompt("أدخل المبلغ الجديد:", payment.amount);
    if (newAmount !== null) {
      const updated = await updatePayment(payment.id, { ...payment, amount: parseFloat(newAmount) });
      setPayments(prev => prev.map(p => p.id === payment.id ? updated : p));
    }
  }

  // ------------------- وظائف المصروفات اليومية / الرواتب -------------------
  async function handleCreateDailyExpense() {
    if (!dailyAmount || !dailyDescription || !dailyExpenseAccountId || !dailyCreditAccountId) {
      return alert("الرجاء إدخال جميع الحقول");
    }

    const res = await createDailyExpense({
      amount: parseFloat(dailyAmount),
      description: dailyDescription,
      expense_account_id: parseInt(dailyExpenseAccountId),
      credit_account_id: parseInt(dailyCreditAccountId)
    });

    // إضافة المصروف الجديد مباشرة للـ state
    setDailyExpenses(prev => [...prev, {
      journal_entry_id: res.journal_entry_id,
      amount: parseFloat(dailyAmount),
      description: dailyDescription,
      expense_account_id: parseInt(dailyExpenseAccountId),
      credit_account_id: parseInt(dailyCreditAccountId)
    }]);

    setDailyAmount("");
    setDailyDescription("");
    setDailyExpenseAccountId("");
    setDailyCreditAccountId("");
  }

  async function handleDeleteDailyExpense(journalEntryId) {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;
    await deleteDailyExpense(journalEntryId);
    setDailyExpenses(prev => prev.filter(d => d.journal_entry_id !== journalEntryId));
  }

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-blue-700">💵 المدفوعات</h2>

      {/* --- Tabs --- */}
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded-l ${activeTab === "payments" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("payments")}
        >
          المدفوعات
        </button>
        <button
          className={`px-4 py-2 rounded-r ${activeTab === "daily" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("daily")}
        >
          المصروفات اليومية / الرواتب
        </button>
      </div>

      {/* ====== Tab: المدفوعات العادية ====== */}
      {activeTab === "payments" && (
        <div>
          {/* نموذج إضافة دفعة */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">إضافة عملية دفع جديدة</h3>
            <div className="grid grid-cols-5 gap-3">
              <select
                className="border p-2 rounded"
                value={newPayment.vendor_id}
                onChange={(e) => setNewPayment({ ...newPayment, vendor_id: e.target.value })}
              >
                <option value="">اختر المورد</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>

              <select
                className="border p-2 rounded"
                value={newPayment.account_id}
                onChange={(e) => setNewPayment({ ...newPayment, account_id: e.target.value })}
              >
                <option value="">اختر الحساب</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>

              <input
                type="date"
                className="border p-2 rounded"
                value={newPayment.date}
                onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
              />
              <input
                type="number"
                className="border p-2 rounded"
                placeholder="المبلغ"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              />
              <input
                type="text"
                className="border p-2 rounded"
                placeholder="المرجع"
                value={newPayment.reference}
                onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
              />
              <button
                onClick={handleCreatePayment}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                حفظ
              </button>
            </div>
          </div>

          {/* جدول المدفوعات */}
          <div className="overflow-x-auto">
            <table className="w-full border text-center">
              <thead className="bg-blue-100">
                <tr>
                  <th className="border p-2">#</th>
                  <th className="border p-2">المورد</th>
                  <th className="border p-2">الحساب</th>
                  <th className="border p-2">التاريخ</th>
                  <th className="border p-2">المبلغ</th>
                  <th className="border p-2">المرجع</th>
                  <th className="border p-2">رقم القيد</th>
                  <th className="border p-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((p, index) => (
                    <tr key={p.id}>
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{vendors.find(v => v.id === p.vendor_id)?.name || "غير معروف"}</td>
                      <td className="border p-2">{accounts.find(a => a.id === p.account_id)?.name || "-"}</td>
                      <td className="border p-2">{p.date}</td>
                      <td className="border p-2">{p.amount}</td>
                      <td className="border p-2">{p.reference || "-"}</td>
                      <td className="border p-2">{p.journal_entry_id || "-"}</td>
                      <td className="border p-2">
                        <button className="bg-green-500 text-white p-1 rounded mr-2" onClick={() => handleEditPayment(p)}>تعديل</button>
                        <button className="bg-red-500 text-white p-1 rounded" onClick={() => handleDeletePayment(p.id)}>حذف</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border p-2 text-center" colSpan={8}>لا توجد مدفوعات حتى الآن</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====== Tab: المصروفات اليومية / الرواتب ====== */}
      {activeTab === "daily" && (
        <div>
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">إضافة مصروف يومي / راتب</h3>
            <div className="grid grid-cols-5 gap-3">
              <select
                className="border p-2 rounded"
                value={dailyExpenseAccountId}
                onChange={(e) => setDailyExpenseAccountId(e.target.value)}
              >
                <option value="">اختر حساب المصروف</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>

              <select
                className="border p-2 rounded"
                value={dailyCreditAccountId}
                onChange={(e) => setDailyCreditAccountId(e.target.value)}
              >
                <option value="">اختر الحساب الدائن</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>

              <input
                type="number"
                className="border p-2 rounded"
                placeholder="المبلغ"
                value={dailyAmount}
                onChange={(e) => setDailyAmount(e.target.value)}
              />

              <input
                type="text"
                className="border p-2 rounded"
                placeholder="الوصف"
                value={dailyDescription}
                onChange={(e) => setDailyDescription(e.target.value)}
              />

              <button
                onClick={handleCreateDailyExpense}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                حفظ
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border text-center">
              <thead className="bg-blue-100">
                <tr>
                  <th className="border p-2">#</th>
                  <th className="border p-2">الوصف</th>
                  <th className="border p-2">حساب المصروف</th>
                  <th className="border p-2">الحساب الدائن</th>
                  <th className="border p-2">المبلغ</th>
                  <th className="border p-2">رقم القيد</th>
                  <th className="border p-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {dailyExpenses.length > 0 ? (
                  dailyExpenses.map((d, index) => (
                    <tr key={d.journal_entry_id}>
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{d.description}</td>
                      <td className="border p-2">{accounts.find(a => a.id === parseInt(d.expense_account_id))?.name || "-"}</td>
                      <td className="border p-2">{accounts.find(a => a.id === parseInt(d.credit_account_id))?.name || "-"}</td>
                      <td className="border p-2">{d.amount}</td>
                      <td className="border p-2">{d.journal_entry_id}</td>
                      <td className="border p-2">
                        <button className="bg-red-500 text-white p-1 rounded" onClick={() => handleDeleteDailyExpense(d.journal_entry_id)}>حذف</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border p-2 text-center" colSpan={7}>لا توجد مصروفات حتى الآن</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
