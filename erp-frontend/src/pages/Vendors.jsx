import { useEffect, useState } from "react";
import { getVendors, createVendor } from "../api/api.js";

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    const data = await getVendors();
    setVendors(data);
    setLoading(false);
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    const newVendor = { name, contact };
    const added = await createVendor(newVendor);
    setVendors([...vendors, added]);
    setName(""); setContact("");
  };

  if (loading) return <div className="text-center mt-8">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <h1 className="text-2xl font-bold mb-4 text-center text-indigo-700">الموردين</h1>

      <form onSubmit={handleAddVendor} className="bg-white p-4 rounded shadow mb-6">
        <input type="text" placeholder="الاسم" value={name} onChange={e => setName(e.target.value)} className="border p-2 w-full mb-2 rounded" required />
        <input type="text" placeholder="جهة الاتصال" value={contact} onChange={e => setContact(e.target.value)} className="border p-2 w-full mb-2 rounded" />
        <button type="submit" className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 w-full">إضافة مورد</button>
      </form>

      <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="py-2 px-4">#</th>
            <th className="py-2 px-4">الاسم</th>
            <th className="py-2 px-4">جهة الاتصال</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map(v => (
            <tr key={v.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{v.id}</td>
              <td className="py-2 px-4">{v.name}</td>
              <td className="py-2 px-4">{v.contact || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Vendors;
