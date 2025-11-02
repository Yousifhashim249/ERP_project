// SalesInvoices.jsx
import { useState, useEffect } from "react";
import {
  getSalesInvoices,
  getDepartments,
  getProducts,
  getSalesInvoicesByDepartment,
  createSalesInvoice
} from "../api/api";

export default function SalesInvoices() {
  const [customerName, setCustomerName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([{ product_id: "", quantity: 0, price: 0 }]);
  const [total, setTotal] = useState(0);

  const [invoices, setInvoices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");

  // ================== Fetch Data ==================
  const fetchInvoices = async () => setInvoices(await getSalesInvoices());
  const fetchDepartments = async () => setDepartments(await getDepartments());
  const fetchProducts = async () => setProducts(await getProducts());
  const fetchInvoicesByDept = async (deptId) => setInvoices(await getSalesInvoicesByDepartment(deptId));

  useEffect(() => {
    fetchDepartments();
    fetchProducts();
    fetchInvoices();
  }, []);

  // ================== Handlers ==================
  const handleDeptChange = (e) => {
    const deptId = e.target.value;
    setSelectedDept(deptId);
    if (deptId) fetchInvoicesByDept(deptId);
    else fetchInvoices();
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);

    const calcTotal = newItems.reduce(
      (acc, i) => acc + (parseFloat(i.quantity || 0) * parseFloat(i.price || 0)),
      0
    );
    setTotal(calcTotal);
  };

  const addItem = () => setItems([...items, { product_id: "", quantity: 0, price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleCreateInvoice = async (e) => {
    e.preventDefault();

    if (!customerName || !departmentId || items.length === 0) {
      alert("الرجاء ملء جميع الحقول وإضافة منتج واحد على الأقل");
      return;
    }

    const validItems = items.every(i => i.product_id && i.quantity > 0 && i.price > 0);
    if (!validItems) {
      alert("الرجاء إدخال جميع بيانات المنتجات بشكل صحيح");
      return;
    }

    const calcTotal = items.reduce(
      (acc, i) => acc + (parseFloat(i.quantity) * parseFloat(i.price)),
      0
    );

    try {
      await createSalesInvoice({
        customer_name: customerName,
        department_id: parseInt(departmentId),
        date,
        total: calcTotal,
        items: items.map(i => ({
          product_id: parseInt(i.product_id),
          quantity: parseFloat(i.quantity),
          price: parseFloat(i.price),
        })),
      });

      alert("تم إنشاء الفاتورة بنجاح!");
      setCustomerName("");
      setDepartmentId("");
      setItems([{ product_id: "", quantity: 0, price: 0 }]);
      setTotal(0);
      fetchInvoices();
    } catch (err) {
      console.error(err.response?.data || err);
      alert("حدث خطأ أثناء إنشاء الفاتورة، تحقق من البيانات");
    }
  };

  // ================== JSX ==================
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">فواتير المبيعات</h1>

      {/* نموذج إدخال فاتورة جديدة */}
      <form onSubmit={handleCreateInvoice} className="border p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">إضافة فاتورة جديدة</h2>

        <div className="mb-2">
          <label>اسم العميل: </label>
          <input
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            required
            className="border p-1"
          />
        </div>

        <div className="mb-2">
          <label>القسم: </label>
          <select
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
            required
            className="border p-1"
          >
            <option value="">اختر القسم</option>
            {departments.map(dep => (
              <option key={dep.id} value={dep.id}>{dep.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label>التاريخ: </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="border p-1"
          />
        </div>

        <h3 className="font-semibold mb-2">المنتجات</h3>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <select
              value={item.product_id}
              onChange={e => handleItemChange(i, "product_id", e.target.value)}
              required
              className="border p-1"
            >
              <option value="">اختر المنتج</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="الكمية"
              value={item.quantity}
              onChange={e => handleItemChange(i, "quantity", e.target.value)}
              required
              className="border p-1"
            />
            <input
              type="number"
              placeholder="السعر"
              value={item.price}
              onChange={e => handleItemChange(i, "price", e.target.value)}
              required
              className="border p-1"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="bg-red-500 text-white px-2 rounded"
            >
              حذف
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="bg-blue-500 text-white px-3 py-1 rounded mb-2"
        >
          إضافة منتج
        </button>
        <div className="mb-2">المجموع: {total}</div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          إنشاء الفاتورة
        </button>
      </form>

      {/* تصفية حسب القسم */}
      <div className="mb-4">
        <label>تصفية حسب القسم: </label>
        <select value={selectedDept} onChange={handleDeptChange} className="border p-1">
          <option value="">كل الأقسام</option>
          {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
        </select>
      </div>

      {/* عرض الفواتير */}
      <table className="border-collapse border border-gray-400 w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">العميل</th>
            <th className="border p-2">التاريخ</th>
            <th className="border p-2">القسم</th>
            <th className="border p-2">الإجمالي</th>
            <th className="border p-2">المنتجات</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td className="border p-2">{inv.id}</td>
              <td className="border p-2">{inv.customer_name}</td>
              <td className="border p-2">{inv.date}</td>
              <td className="border p-2">
                {departments.find(d => d.id === inv.department_id)?.name || ""}
              </td>
              <td className="border p-2">{inv.total}</td>
              <td className="border p-2">
                <ul>
                  {inv.items.map(item => {
                    const product = products.find(p => p.id === item.product_id);
                    return (
                      <li key={item.id}>
                        {product ? product.name : `معرف ${item.product_id}`} | كمية: {item.quantity} | سعر: {item.price}
                      </li>
                    );
                  })}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
