import { Link } from "react-router-dom";

function Dashboard() {
  const sections = [
    { name: "الموظفين", path: "/employees", emoji: "👨‍💼" },
    { name: "الحسابات", path: "/accounts", emoji: "📘" },
    { name: "المنتجات", path: "/products", emoji: "📦" },
    { name: "الموردين", path: "/vendors", emoji: "🏢" },
    { name: "الأصول", path: "/assets", emoji: "💰" },
  ];

  return (
    <div className="max-w-6xl mx-auto text-center mt-12">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">
        💎 الأقسام الرئيسية للنظام
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec) => (
          <Link
            key={sec.name}
            to={sec.path}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col items-center justify-center text-xl font-semibold text-indigo-600"
          >
            <span className="text-5xl mb-4">{sec.emoji}</span>
            {sec.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
