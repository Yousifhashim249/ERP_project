import React, { useState, useEffect } from "react";
import { getDepartments, getVendors } from "../api/api";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function ConsumablesInvoiceAutocomplete() {
  const [departments, setDepartments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorInvoices, setVendorInvoices] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    department_id: null,
    vendor_id: null,
    date: new Date().toISOString().split("T")[0],
    lines: [{ product_name: "", quantity: 1, unit_price: 0 }],
  });

  useEffect(() => {
    async function fetchData() {
      setDepartments(await getDepartments());
      setVendors(await getVendors());
      fetchInvoices();
    }
    fetchData();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/vendor_invoices`);
      setVendorInvoices(data);

      const names = new Set();
      data.forEach((inv) => {
        inv.lines?.forEach((line) => {
          if (line.product_name) names.add(line.product_name);
        });
      });
      setProductSuggestions([...names]);
    } catch (error) {
      console.error("خطأ عند جلب الفواتير:", error);
      setVendorInvoices([]);
    }
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...invoiceData.lines];
    newLines[index][field] =
      field === "quantity" || field === "unit_price"
        ? parseFloat(value) || 0
        : value;
    setInvoiceData({ ...invoiceData, lines: newLines });
  };

  const addLine = () => {
    setInvoiceData((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        { product_name: "", quantity: 1, unit_price: 0 },
      ],
    }));
  };

  const removeLine = (index) => {
    const newLines = invoiceData.lines.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, lines: newLines });
  };

  const calculateSubtotal = (line) =>
    ((line.quantity || 0) * (line.unit_price || 0)).toFixed(2);

  const calculateTotal = () =>
    invoiceData.lines
      .reduce(
        (sum, l) => sum + (l.quantity || 0) * (l.unit_price || 0),
        0
      )
      .toFixed(2);

  const handleSubmit = async () => {
    if (invoiceData.lines.length === 0) {
      alert("يجب إضافة سطر واحد على الأقل");
      return;
    }

    const total = invoiceData.lines.reduce(
      (sum, l) =>
        sum +
        parseFloat(l.quantity || 0) *
          parseFloat(l.unit_price || 0),
      0
    );

    const payload = {
      vendor_id: invoiceData.vendor_id, // هنا يتم إرسال المورد
      department_id: invoiceData.department_id
        ? parseInt(invoiceData.department_id)
        : null,
      date: invoiceData.date,
      total,
      lines: invoiceData.lines.map((l) => ({
        product_name: l.product_name,
        quantity: parseFloat(l.quantity || 0),
        unit_price: parseFloat(l.unit_price || 0),
      })),
    };

    try {
      await axios.post(
        `${API_URL}/vendor_invoices_with_stock?move_type=consumable`,
        payload
      );
      fetchInvoices();
      setInvoiceData({
        department_id: null,
        vendor_id: null,
        date: new Date().toISOString().split("T")[0],
        lines: [{ product_name: "", quantity: 1, unit_price: 0 }],
      });
      alert("تم حفظ الفاتورة كمستهلكات يومية ✅");
    } catch (error) {
      console.error("خطأ عند إنشاء الفاتورة:", error);
      alert("حدث خطأ أثناء إنشاء الفاتورة.");
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) return;
    try {
      await axios.delete(`${API_URL}/vendor_invoices/${id}`);
      fetchInvoices();
    } catch (error) {
      console.error("خطأ عند حذف الفاتورة:", error);
      alert("حدث خطأ أثناء حذف الفاتورة.");
    }
  };

  const handleKeyNavigation = (e, rowIdx, colIdx) => {
    const totalRows = invoiceData.lines.length;
    const totalCols = 3;
    const isEnter = e.key === "Enter";
    const isRight = e.key === "ArrowRight";
    const isLeft = e.key === "ArrowLeft";
    const isDown = e.key === "ArrowDown";
    const isUp = e.key === "ArrowUp";

    if (isEnter) e.preventDefault();

    let nextRow = rowIdx;
    let nextCol = colIdx;

    if (isEnter || isRight) nextCol++;
    if (isLeft) nextCol--;
    if (isDown) nextRow++;
    if (isUp) nextRow--;

    if (nextCol >= totalCols) {
      nextCol = 0;
      nextRow++;
      if (nextRow >= totalRows) {
        addLine();
        setTimeout(() => {
          const nextInput = document.querySelector(
            `[data-row="${nextRow}"][data-col="0"]`
          );
          nextInput?.focus();
        }, 100);
        return;
      }
    }

    if (nextCol < 0) nextCol = 0;
    if (nextRow < 0) nextRow = 0;

    const nextInput = document.querySelector(
      `[data-row="${nextRow}"][data-col="${nextCol}"]`
    );
    nextInput?.focus();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        فاتورة مستهلكات يومية
      </h1>

      {/* Department & Vendor & Date */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <select
          value={invoiceData.department_id || ""}
          onChange={(e) =>
            setInvoiceData({
              ...invoiceData,
              department_id: e.target.value,
            })
          }
          className="border p-1"
        >
          <option value="">اختر القسم</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={invoiceData.vendor_id || ""}
          onChange={(e) =>
            setInvoiceData({
              ...invoiceData,
              vendor_id: e.target.value,
            })
          }
          className="border p-1"
        >
          <option value="">اختر المورد</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <input
        type="date"
        value={invoiceData.date}
        onChange={(e) =>
          setInvoiceData({
            ...invoiceData,
            date: e.target.value,
          })
        }
        className="border p-1 mb-4"
      />

      {/* Lines Table */}
      <table className="table-auto w-full mb-4 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">اسم المنتج</th>
            <th className="border p-2">الكمية</th>
            <th className="border p-2">سعر الوحدة</th>
            <th className="border p-2">المجموع الفرعي</th>
            <th className="border p-2">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.lines.map((line, rowIdx) => (
            <tr key={rowIdx}>
              {["product_name", "quantity", "unit_price"].map(
                (field, colIdx) => (
                  <td key={field} className="border p-2">
                    <input
                      type={field === "product_name" ? "text" : "number"}
                      list={
                        field === "product_name"
                          ? "products-list"
                          : undefined
                      }
                      value={line[field] || ""}
                      onChange={(e) =>
                        handleLineChange(
                          rowIdx,
                          field,
                          e.target.value
                        )
                      }
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) =>
                        handleKeyNavigation(e, rowIdx, colIdx)
                      }
                      data-row={rowIdx}
                      data-col={colIdx}
                      className="border p-1 w-full"
                    />
                  </td>
                )
              )}
              <td className="border p-2">{calculateSubtotal(line)}</td>
              <td className="border p-2">
                <button
                  onClick={() => removeLine(rowIdx)}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <datalist id="products-list">
        {productSuggestions.map((name, i) => (
          <option key={i} value={name} />
        ))}
      </datalist>

      <button
        onClick={addLine}
        className="bg-blue-500 text-white p-2 rounded mb-4"
      >
        إضافة سطر منتج
      </button>

      <div className="mb-4 text-right font-bold">
        المجموع النهائي: {calculateTotal()}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white p-2 rounded"
      >
        حفظ الفاتورة  
      </button>

      {/* Previous Invoices */}
      <h2 className="text-lg font-bold mt-8 mb-2">
        الفواتير اليومية السابقة
      </h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">#ID</th>
            <th className="border p-2">التاريخ</th>
            <th className="border p-2">القسم</th>
            <th className="border p-2">المورد</th> 
            <th className="border p-2">الخطوط</th>
            <th className="border p-2">المجموع</th>
            <th className="border p-2">إجراءات</th>
          </tr>
        </thead>
        <tbody>
         {[...vendorInvoices]
  .sort((a, b) => b.id - a.id)
  .map((inv) => (

            <tr key={inv.id}>
              <td className="border p-2">{inv.id}</td>
              <td className="border p-2">{inv.date}</td>
              <td className="border p-2">{inv.department_name || "غير محدد"}</td>
              <td className="border p-2 font-semibold text-blue-700">{inv.vendor_name || "غير محدد"}</td>
              <td className="border p-2">
                <ul>
                  {inv.lines?.map((line, idx) => (
                    <li key={idx}>
                      {line.product_name} - {line.quantity} × {line.unit_price} = {line.subtotal}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="border p-2">{inv.total}</td>
              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => handleDeleteInvoice(inv.id)}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
