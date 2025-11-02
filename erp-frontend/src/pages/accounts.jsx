import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "Asset",
    parent_id: "",
    balance: 0,
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // 🧭 جلب الحسابات
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/accounts`);
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error("خطأ في جلب الحسابات:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 🟢 إنشاء حساب / تعديل حساب
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editMode ? "PUT" : "POST";
      const url = editMode
        ? `${API_URL}/accounts/${selectedId}`
        : `${API_URL}/accounts`;

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json; charset=UTF-8" // ← تم التعديل لدعم العربي
        },
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id ? Number(formData.parent_id) : null,
          balance: Number(formData.balance),
        }),
      });

      if (!res.ok) throw new Error("فشل في حفظ الحساب");
      await fetchAccounts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  // 🔴 حذف حساب
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الحساب؟")) return;
    try {
      await fetch(`${API_URL}/accounts/${id}`, { method: "DELETE" });
      await fetchAccounts();
    } catch (error) {
      console.error(error);
    }
  };

  // ✏️ تعديل حساب
  const handleEdit = (acc) => {
    setEditMode(true);
    setSelectedId(acc.id);
    setFormData({
      name: acc.name,
      code: acc.code,
      type: acc.type,
      parent_id: acc.parent_id || "",
      balance: acc.balance,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "Asset",
      parent_id: "",
      balance: 0,
    });
    setEditMode(false);
    setSelectedId(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">📘 دليل الحسابات</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} /> إضافة حساب
        </button>
      </div>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">الكود</th>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">النوع</th>
                <th className="px-4 py-3">الرصيد</th>
                <th className="px-4 py-3">الأب</th>
                <th className="px-4 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">{acc.code}</td>
                    <td className="px-4 py-2 font-medium">{acc.name}</td>
                    <td className="px-4 py-2">{acc.type}</td>
                    <td className="px-4 py-2">{acc.balance}</td>
                    <td className="px-4 py-2">
                      {acc.parent_id
                        ? accounts.find((a) => a.id === acc.parent_id)?.name
                        : "—"}
                    </td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(acc)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    لا توجد حسابات مسجلة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🪟 نافذة الإضافة / التعديل */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {editMode ? "تعديل حساب" : "إضافة حساب جديد"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="الكود"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="اسم الحساب"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />

              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                <option value="Asset">أصل (Asset)</option>
                <option value="Liability">التزام (Liability)</option>
                <option value="Expense">مصروف (Expense)</option>
                <option value="Revenue">إيراد (Revenue)</option>
                <option value="Equity">حقوق ملكية (Equity)</option>
              </select>

              <select
                value={formData.parent_id}
                onChange={(e) =>
                  setFormData({ ...formData, parent_id: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                <option value="">بدون أب</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="الرصيد الافتتاحي"
                value={formData.balance}
                onChange={(e) =>
                  setFormData({ ...formData, balance: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editMode ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
