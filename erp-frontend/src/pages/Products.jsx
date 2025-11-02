import { useEffect, useState } from "react";
import { getProducts, createProduct, createStockMove, getDepartments, getStockMoves } from "../api/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);

  // For forms
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [moveQty, setMoveQty] = useState("");
  const [moveType, setMoveType] = useState("توريد");

  // Tabs
  const [activeTab, setActiveTab] = useState("products");

  // Filters for moves
  const [filterProduct, setFilterProduct] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getProducts();
    const deps = await getDepartments();
    const allMoves = await getStockMoves();
    setProducts(data);
    setDepartments(deps);
    setMoves(allMoves);
    setLoading(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const newProduct = {
      name,
      description,
      quantity_on_hand: parseFloat(quantity) || 0,
      reorder_level: parseFloat(reorderLevel) || 0,
    };
    const added = await createProduct(newProduct);
    setProducts([...products, added]);
    setName(""); setDescription(""); setQuantity(""); setReorderLevel("");
    alert("تم إضافة المنتج ✅");
  };

  const handleStockMove = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return alert("اختر منتجًا أولًا");
    if (!selectedDepartment) return alert("اختر القسم");

    const quantityValue = parseFloat(moveQty);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      alert("الكمية غير صحيحة");
      return;
    }

    const move = {
      product_id: selectedProduct.id,
      warehouse_id: 1,
      department_id: parseInt(selectedDepartment),
      date: new Date().toISOString().split("T")[0],
      quantity: moveValueByType(quantityValue, moveType),
      move_type: moveType === "صرف" ? "out" : "in",
      reference: `فاتورة ${moveType}`,
      purpose: "stock",
    };

    const resp = await createStockMove(move);

    // تحديث المنتج مباشرة
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              quantity_on_hand: resp.current_quantity,
              reorder_level: resp.reorder_level ?? p.reorder_level,
              low_stock_alert: resp.low_stock_alert,
            }
          : p
      )
    );

    setMoves((prev) => [
      ...prev,
      {
        id: resp.id,
        product_name: resp.product_name,
        department_name: resp.department_name,
        move_type: resp.move_type,
        quantity: resp.quantity,
        reference: resp.reference,
        date: resp.date,
      },
    ]);

    alert(`تمت عملية ${moveType} بنجاح ✅`);
    setMoveQty(""); setSelectedProduct(null);
  };

  const moveValueByType = (value, type) => (type === "صرف" ? -value : value);

  if (loading) return <div className="text-center mt-8">جاري التحميل...</div>;

  // Filtered moves
  const filteredMoves = moves.filter(
    (m) =>
      (filterProduct === "" || m.product_name === filterProduct) &&
      (filterDepartment === "" || m.department_name === filterDepartment)
  );

  return (
    <div className="max-w-7xl mx-auto mt-6 p-2">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-4 space-x-4">
        <button
          className={`px-4 py-2 font-semibold ${activeTab === "products" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("products")}
        >
          المنتجات
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeTab === "stock" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("stock")}
        >
          حركة المخزون
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeTab === "moves" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("moves")}
        >
          سجل العمليات
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="bg-white shadow-lg rounded-lg p-4 overflow-x-auto">
          <h1 className="text-2xl font-bold mb-4 text-indigo-700 text-center">المنتجات والمخزون</h1>

          {/* Add Product Form */}
          <form onSubmit={handleAddProduct} className="mb-6 space-y-3 max-w-md mx-auto bg-gray-50 p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-2 text-indigo-600 text-center">إضافة منتج جديد</h2>
            <input
              type="text"
              placeholder="اسم المنتج"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="الوصف"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 w-full rounded"
            />
            <input
              type="number"
              placeholder="الكمية الحالية"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
            <input
              type="number"
              placeholder="الحد الأدنى للكمية"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
            <button type="submit" className="bg-indigo-500 text-white py-2 px-4 rounded w-full hover:bg-indigo-600">
              إضافة المنتج
            </button>
          </form>

          {/* Products Table */}
          <table className="w-full text-center border table-auto">
            <thead className="bg-indigo-500 text-white">
              <tr>
                <th className="py-2 px-4">#</th>
                <th className="py-2 px-4">الاسم</th>
                <th className="py-2 px-4">الوصف</th>
                <th className="py-2 px-4">الكمية الحالية</th>
                <th className="py-2 px-4">الحد الأدنى</th>
                <th className="py-2 px-4">تنبيه</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{p.id}</td>
                  <td className="py-2 px-4">{p.name}</td>
                  <td className="py-2 px-4">{p.description || "-"}</td>
                  <td className="py-2 px-4">{p.quantity_on_hand}</td>
                  <td className="py-2 px-4">{p.reorder_level ?? 0}</td>
                  <td className="py-2 px-4">
                    {p.quantity_on_hand < (p.reorder_level ?? 0) ? (
                      <span className="text-sm bg-red-100 text-red-700 py-1 px-2 rounded">ناقص</span>
                    ) : (
                      <span className="text-sm bg-green-100 text-green-700 py-1 px-2 rounded">ممتاز</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Tab */}
      {activeTab === "stock" && (
        <div className="bg-white shadow-lg rounded-lg p-4 max-w-md mx-auto">
          <h2 className="text-lg font-bold mb-3 text-indigo-600">فاتورة صرف / توريد</h2>
          <form onSubmit={handleStockMove} className="space-y-3">
            <select
              className="border p-2 w-full rounded"
              value={selectedProduct?.id || ""}
              onChange={(e) => setSelectedProduct(products.find((p) => p.id === parseInt(e.target.value)))}
              required
            >
              <option value="">اختر المنتج</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <select
              className="border p-2 w-full rounded"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              required
            >
              <option value="">اختر القسم</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            <select className="border p-2 w-full rounded" value={moveType} onChange={(e) => setMoveType(e.target.value)}>
              <option value="توريد">توريد</option>
              <option value="صرف">صرف</option>
            </select>

            <input
              type="number"
              placeholder="الكمية"
              value={moveQty}
              onChange={(e) => setMoveQty(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />

            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full">
              تنفيذ العملية
            </button>
          </form>
        </div>
      )}

      {/* Moves Tab */}
      {activeTab === "moves" && (
        <div className="bg-white shadow-lg rounded-lg p-4 overflow-x-auto">
          <h3 className="text-lg font-bold text-indigo-600 mb-2">آخر العمليات</h3>

          {/* Filters */}
          <div className="flex space-x-2 mb-3">
            <select
              className="border p-2 rounded"
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
            >
              <option value="">الكل المنتجات</option>
              {products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>

            <select
              className="border p-2 rounded"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">الكل الأقسام</option>
              {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          {filteredMoves.length === 0 ? (
            <div className="text-center text-gray-500 py-4">لا توجد عمليات مخزون حتى الآن</div>
          ) : (
            <table className="w-full text-center border text-sm table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-1 px-2">القسم</th>
                  <th className="py-1 px-2">المنتج</th>
                  <th className="py-1 px-2">النوع</th>
                  <th className="py-1 px-2">الكمية</th>
                  <th className="py-1 px-2">المرجع</th>
                  <th className="py-1 px-2">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filteredMoves.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td>{m.department_name || "-"}</td>
                    <td>{m.product_name || "-"}</td>
                    <td>{m.move_type === "in" ? "توريد" : "صرف"}</td>
                    <td>{m.quantity}</td>
                    <td>{m.reference || "-"}</td>
                    <td>{m.date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
