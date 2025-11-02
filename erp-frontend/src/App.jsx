// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Employees from "./pages/Employees.jsx";
import Products from "./pages/Products.jsx";
import Vendors from "./pages/Vendors.jsx";
import Assets from "./pages/Assets.jsx";
import AccountsSection from "./pages/AccountsSection.jsx"; // واجهة قسم المحاسبة (دليل الحسابات + قيود اليومية)
import Reports from "./pages/Reports.jsx"; // واجهة التقارير الختامية
import InvoiceManager from "./pages/InvoiceManager"; // الفواتير
import InvoicesPage from "./pages/InvoicesPage.jsx";
import SalesInvoices from "./pages/SalesInvoices";
import ExpenseAnalysis from "./pages/ExpenseAnalysis"; 
function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <Routes>
          {/* ====== لوحة التحكم ====== */}
          <Route path="/" element={<Dashboard />} />

          {/* ====== قسم الموارد البشرية ====== */}
          <Route path="/employees" element={<Employees />} />

          {/* ====== قسم المنتجات ====== */}
          <Route path="/products" element={<Products />} />

          {/* ====== قسم الموردين ====== */}
          <Route path="/vendors" element={<Vendors />} />

          {/* ====== قسم الأصول ====== */}
          <Route path="/assets" element={<Assets />} />

          {/* ====== قسم المحاسبة (دليل الحسابات + قيود اليومية) ====== */}
          <Route path="/accounting" element={<AccountsSection />} />

          {/* ====== التقارير الختامية ====== */}
          <Route path="/reports" element={<Reports />} />

          {/* ====== قسم الفواتير ====== */}
          <Route path="/invoices" element={<InvoiceManager />} />

          {/* ====== قسم صفحات الفواتير ====== */}
          <Route path="/InvoiceManager" element={<InvoicesPage />} />

          {/* ====== قسم مبيعات الفواتير ====== */}
          <Route path="/sales-invoices" element={<SalesInvoices />} /> 

          {/* ====== قسم تحليل المصروفات ====== */}
         <Route path="/expense-analysis" element={<ExpenseAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
