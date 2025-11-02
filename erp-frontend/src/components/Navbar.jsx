import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const sections = [
    { name: "الموظفين", path: "/employees", emoji: "👨‍💼" },
    { name: "الحسابات", path: "/accounting", emoji: "📘" },
    { name: "المنتجات", path: "/products", emoji: "📦" },
    { name: "الموردين", path: "/vendors", emoji: "🏢" },
    { name: "الأصول", path: "/assets", emoji: "💰" },
    { name: "التقارير", path: "/reports", emoji: "📊" },
    { name: "الفواتير", path: "/invoices", emoji: "🧾" }, 
    { name: "فواتير الأقسام والموردين", path: "/InvoiceManager", emoji: "📑" }, 
    { name: "فواتير المبيعات", path: "/sales-invoices", emoji: "🧾" },
    { name: "تحليل المصروفات", path: "/expense-analysis", emoji: "📊" }, 
  ];

  const linkClasses = (path) =>
    `px-6 py-3 rounded-xl shadow-md flex items-center gap-3 transition ${
      location.pathname === path
        ? "bg-indigo-800 font-bold"
        : "bg-indigo-500 hover:bg-indigo-700"
    } text-white`;

  return (
    <nav className="bg-indigo-600 py-4 shadow-md">
      <div className="container mx-auto flex justify-center flex-wrap gap-6">
        {sections.map((sec) => (
          <Link key={sec.name} to={sec.path} className={linkClasses(sec.path)}>
            <span className="text-2xl">{sec.emoji}</span>
            <span className="font-semibold">{sec.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
