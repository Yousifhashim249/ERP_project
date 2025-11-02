import { useEffect, useState, useRef } from "react";
import { getDepartments, getVendors } from "../api/api";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function InvoicesPage() {
  const [departments, setDepartments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedType, setSelectedType] = useState("department");
  const [selectedId, setSelectedId] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [totalAllInvoices, setTotalAllInvoices] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const printRef = useRef();

  useEffect(() => {
    getDepartments().then(setDepartments);
    getVendors().then(setVendors);
  }, []);

  const fetchInvoices = async (id) => {
    setSelectedId(id);
    const url =
      selectedType === "department"
        ? `${API_URL}/vendor_invoices/by_department/${id}`
        : `${API_URL}/vendor_invoices/by_vendor/${id}`;

    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const { data } = await axios.get(url, { params });

// ✅ ترتيب الفواتير حسب التاريخ (الأقدم أولاً)
data.sort((a, b) => new Date(a.date) - new Date(b.date));

setInvoices(data);


      // ✅ جمع كل الفواتير مرة واحدة
      const grandTotal = data.reduce((sum, inv) => {
        const invoiceTotal = inv.lines.reduce((s, l) => s + l.subtotal, 0);
        return sum + invoiceTotal;
      }, 0);

      setTotalAllInvoices(grandTotal.toFixed(2));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
      setTotalAllInvoices(0);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
        <head>
          <title>فواتير ${selectedType === "department" ? "القسم" : "المورد"}</title>
          <style>
            body { font-family: "Tahoma", sans-serif; direction: rtl; text-align: right; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            .invoice-total { font-weight: bold; background-color: #ddd; }
            h2 { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">
        📑 فواتير المراجعة حسب {selectedType === "department" ? "القسم" : "المورد"}
      </h2>

      {/* اختيار النوع */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${selectedType === "department" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => {
            setSelectedType("department");
            setSelectedId(null);
            setInvoices([]);
            setTotalAllInvoices(0);
          }}
        >
          الأقسام
        </button>
        <button
          className={`px-4 py-2 rounded ${selectedType === "vendor" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => {
            setSelectedType("vendor");
            setSelectedId(null);
            setInvoices([]);
            setTotalAllInvoices(0);
          }}
        >
          الموردين
        </button>
      </div>

      {/* فلتر التاريخ */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <label className="mr-2 text-sm text-gray-600">من:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <div>
          <label className="mr-2 text-sm text-gray-600">إلى:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
      </div>

      {/* قائمة الاختيار */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(selectedType === "department" ? departments : vendors).map((item) => (
          <button
            key={item.id}
            className={`px-3 py-2 border rounded ${selectedId === item.id ? "bg-blue-100 border-blue-400" : "bg-white"}`}
            onClick={() => fetchInvoices(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* جدول الفواتير */}
      <div ref={printRef}>
        {invoices.length > 0 ? (
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th>رقم الفاتورة</th>
                <th>التاريخ</th>
                <th>المورد</th>
                <th>القسم</th>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الإجمالي</th>
                <th>إجمالي الفاتورة</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const invoiceTotal = inv.lines.reduce((sum, l) => sum + l.subtotal, 0);

                return inv.lines.map((line, index) => (
                  <tr
                    key={`${inv.id}-${index}`}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {index === 0 && <td rowSpan={inv.lines.length}>{inv.id}</td>}
                    {index === 0 && <td rowSpan={inv.lines.length}>{inv.date}</td>}
                    {index === 0 && (
                      <td rowSpan={inv.lines.length}>{inv.vendor_name || "غير محدد"}</td>
                    )}
                    {index === 0 && (
                      <td rowSpan={inv.lines.length}>
                        {inv.department_name || "غير محدد"}
                      </td>
                    )}
                    <td>{line.product_name}</td>
                    <td>{line.quantity}</td>
                    <td>{line.unit_price}</td>
                    <td>{line.subtotal}</td>
                    {/* ✅ عرض إجمالي الفاتورة مرة واحدة فقط */}
                    {index === 0 && (
                      <td rowSpan={inv.lines.length}>{invoiceTotal.toFixed(2)}</td>
                    )}
                  </tr>
                ));
              })}
              <tr className="invoice-total">
                <td colSpan={8} className="text-right font-bold">
                  إجمالي الفواتير المختارة
                </td>
                <td className="font-bold">{totalAllInvoices}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">لا توجد فواتير لعرضها.</p>
        )}
      </div>

      {/* زر الطباعة */}
      {invoices.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🖨️ طباعة الفواتير المختارة
          </button>
        </div>
      )}
    </div>
  );
}
