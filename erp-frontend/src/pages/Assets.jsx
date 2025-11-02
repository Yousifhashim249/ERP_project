import { useEffect, useState } from "react";
import { getAssets, createAsset } from "../api/api.js";

function Assets() {
  const [assets, setAssets] = useState([]);
  const [name, setName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [cost, setCost] = useState("");
  const [depreciation, setDepreciation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    const data = await getAssets();
    setAssets(data);
    setLoading(false);
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    const newAsset = {
      name,
      purchase_date: purchaseDate || null,
      cost: parseFloat(cost),
      depreciation_rate: parseFloat(depreciation),
    };
    const added = await createAsset(newAsset);
    setAssets([...assets, added]);
    setName(""); setPurchaseDate(""); setCost(""); setDepreciation("");
  };

  if (loading) return <div className="text-center mt-8">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <h1 className="text-2xl font-bold mb-4 text-center text-indigo-700">الأصول</h1>

      <form onSubmit={handleAddAsset} className="bg-white p-4 rounded shadow mb-6">
        <input type="text" placeholder="الاسم" value={name} onChange={e => setName(e.target.value)} className="border p-2 w-full mb-2 rounded" required />
        <input type="date" placeholder="تاريخ الشراء" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="border p-2 w-full mb-2 rounded" />
        <input type="number" placeholder="التكلفة" value={cost} onChange={e => setCost(e.target.value)} className="border p-2 w-full mb-2 rounded" required />
        <input type="number" placeholder="نسبة الإهلاك" value={depreciation} onChange={e => setDepreciation(e.target.value)} className="border p-2 w-full mb-2 rounded" required />
        <button type="submit" className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 w-full">إضافة أصل</button>
      </form>

      <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="py-2 px-4">#</th>
            <th className="py-2 px-4">الاسم</th>
            <th className="py-2 px-4">تاريخ الشراء</th>
            <th className="py-2 px-4">التكلفة</th>
            <th className="py-2 px-4">نسبة الإهلاك</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(a => (
            <tr key={a.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{a.id}</td>
              <td className="py-2 px-4">{a.name}</td>
              <td className="py-2 px-4">{a.purchase_date || "-"}</td>
              <td className="py-2 px-4">{a.cost}</td>
              <td className="py-2 px-4">{a.depreciation_rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Assets;
