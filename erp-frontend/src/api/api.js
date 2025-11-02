// src/api/api.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

// ---------------- Employees ----------------
export const getEmployees = async () => {
  const { data } = await axios.get(`${API_URL}/employees`);
  return data;
};

export const createEmployee = async (employee) => {
  const { data } = await axios.post(`${API_URL}/employees`, employee);
  return data;
};

export const updateEmployee = async (id, employee) => {
  const { data } = await axios.put(`${API_URL}/employees/${id}`, employee);
  return data;
};

export const deleteEmployee = async (id) => {
  const { data } = await axios.delete(`${API_URL}/employees/${id}`);
  return data;
};
// ---------------- Salary Slips ----------------
export const getSalarySlip = async (employee_id, month) => {
  const { data } = await axios.get(`${API_URL}/salary_slips/${employee_id}/${month}`);
  return data;
};


// ---------------- Deductions ----------------
export const getDeductions = async () => {
  const { data } = await axios.get(`${API_URL}/deductions`);
  return data;
};

export const createDeduction = async (deduction) => {
  const { data } = await axios.post(`${API_URL}/deductions`, deduction);
  return data;
};

export const updateDeduction = async (id, deduction) => {
  const { data } = await axios.put(`${API_URL}/deductions/${id}`, deduction);
  return data;
};

export const deleteDeduction = async (id) => {
  const { data } = await axios.delete(`${API_URL}/deductions/${id}`);
  return data;
};

// ---------------- Bonuses ----------------
export const getBonuses = async () => {
  const { data } = await axios.get(`${API_URL}/bonuses`);
  return data;
};

export const createBonus = async (bonus) => {
  const { data } = await axios.post(`${API_URL}/bonuses`, bonus);
  return data;
};

export const updateBonus = async (id, bonus) => {
  const { data } = await axios.put(`${API_URL}/bonuses/${id}`, bonus);
  return data;
};

export const deleteBonus = async (id) => {
  const { data } = await axios.delete(`${API_URL}/bonuses/${id}`);
  return data;
};

// ---------------- Departments ----------------
export const getDepartments = async () => {
  const { data } = await axios.get(`${API_URL}/departments`);
  return data;
};

export const createDepartment = async (dept) => {
  const { data } = await axios.post(`${API_URL}/departments`, dept);
  return data;
};

export const updateDepartment = async (id, dept) => {
  const { data } = await axios.put(`${API_URL}/departments/${id}`, dept);
  return data;
};

export const deleteDepartment = async (id) => {
  const { data } = await axios.delete(`${API_URL}/departments/${id}`);
  return data;
};
// ================== Accounts ==================
// جلب كل الحسابات
export async function getAccounts() {
  const res = await axios.get(`${API_URL}/accounts`);
  return res.data;
}

// إنشاء حساب جديد
// إنشاء حساب جديد مع التأكد من الترميز
export async function createAccount(account) {
  const res = await axios.post(`${API_URL}/accounts`, account, {
    headers: {
      "Content-Type": "application/json; charset=UTF-8"  // ← هذا يضمن دعم العربي
    }
  });
  return res.data;
}


// ================== Journal Entries ==================
// جلب كل القيود اليومية
export async function getJournalEntries() {
  const res = await axios.get(`${API_URL}/journal_entries`);
  return res.data;
}

// إنشاء قيد يومية جديد
export async function createJournalEntry(entry) {
  const res = await axios.post(`${API_URL}/journal_entries`, entry);
  return res.data;
}

// ================== Transaction Lines ==================
// جلب كل سطور القيود
export async function getTransactionLines() {
  const res = await axios.get(`${API_URL}/transaction_lines`);
  return res.data;
}

// إنشاء سطر قيد جديد
export async function createTransactionLine(line) {
  const res = await axios.post(`${API_URL}/transaction_lines`, line);
  return res.data;
}

// ================== Vendors ==================
// جلب كل الموردين
export async function getVendors() {
  const res = await axios.get(`${API_URL}/vendors`);
  return res.data;
}

// إنشاء مورد جديد
export async function createVendor(vendor) {
  const res = await axios.post(`${API_URL}/vendors`, vendor);
  return res.data;
}
// ================== Vendor Invoices (فواتير الشراء) ==================

// إنشاء فاتورة مورد
export async function createVendorInvoice(invoice) {
  const res = await axios.post(`${API_URL}/vendor_invoices`, invoice);
  return res.data;
}


// جلب كل فواتير الموردين
export async function getVendorInvoices() {
  const res = await axios.get(`${API_URL}/vendor_invoices`);
  return res.data;
}

// حذف فاتورة مورد
export async function deleteVendorInvoice(id) {
  const res = await axios.delete(`${API_URL}/vendor_invoices/${id}`);
  return res.data;
}

// ================== Sales Invoices (فواتير المبيعات) ==================

// إنشاء فاتورة بيع للعميل
// يتم خصم المخزون لكل منتج + إنشاء القيد المحاسبي تلقائيًا
export async function createSalesInvoice(invoice, warehouse_id = 1) {
  /**
   * invoice = {
   *   customer_id,
   *   date,
   *   total,
   *   lines: [{ product_id, quantity, unit_price }]
   * }
   */
  const res = await axios.post(`${API_URL}/sales_invoices_with_stock`, {
    ...invoice,
    warehouse_id
  });
  return res.data;
}

// جلب كل فواتير المبيعات
export async function getSalesInvoices() {
  const res = await axios.get(`${API_URL}/sales_invoices`);
  return res.data;
}
// جلب فواتير حسب القسم
export async function getSalesInvoicesByDepartment(department_id) {
  const res = await axios.get(`${API_URL}/sales_invoices/by_department/${department_id}`);
  return res.data;
}


// حذف فاتورة مبيعات
export async function deleteSalesInvoice(id) {
  const res = await axios.delete(`${API_URL}/sales_invoices/${id}`);
  return res.data;
}

// ================== Payments (المدفوعات) ==================

// ================== Payments (المدفوعات) ==================

// إنشاء دفعة لمورد
export async function createPayment(payment) {
  const res = await axios.post(`${API_URL}/payments`, payment);
  return res.data;
}

// جلب كل المدفوعات
export async function getPayments() {
  const res = await axios.get(`${API_URL}/payments`);
  return res.data;
}

// تعديل دفعة موجودة
export async function updatePayment(id, payment) {
  const res = await axios.put(`${API_URL}/payments/${id}`, payment);
  return res.data;
}

// حذف دفعة
export async function deletePayment(id) {
  const res = await axios.delete(`${API_URL}/payments/${id}`);
  return res.data;
}

// ================== Products ==================
// جلب كل المنتجات
export async function getProducts() {
  const res = await axios.get(`${API_URL}/products`);
  return res.data;
}

// إنشاء منتج جديد
// دعم is_daily_consumable لتحديد المواد اليومية
export async function createProduct(product) {
  const res = await axios.post(`${API_URL}/products`, product);
  return res.data;
}

// تحديث منتج موجود
export async function updateProduct(id, updatedProduct) {
  const res = await axios.put(`${API_URL}/products/${id}`, updatedProduct);
  return res.data;
}

// ================== Stock Moves ==================
// إنشاء حركة مخزون مباشرة
export async function createStockMove(move) {
  const res = await axios.post(`${API_URL}/stock_moves`, move);
  return res.data;
}
// ================== Stock Moves ==================
// جلب كل حركات المخزون
export async function getStockMoves() {
  const res = await axios.get(`${API_URL}/stock_moves`);
  return res.data;
}


// ================== Inventory Report ==================
// جلب تقرير المخزون لجميع المنتجات
export async function getInventoryReport() {
  const res = await axios.get(`${API_URL}/inventory_report`);
  return res.data;
}

// ================== Assets ==================
// جلب كل الأصول
export async function getAssets() {
  const res = await axios.get(`${API_URL}/assets`);
  return res.data;
}

// إنشاء أصل جديد
export async function createAsset(asset) {
  const res = await axios.post(`${API_URL}/assets`, asset);
  return res.data;
}

// ================== Financial Reports ==================
// جلب ميزان المراجعة
export async function getTrialBalance() {
  const res = await axios.get(`${API_URL}/trial_balance`);
  return res.data;
}

// جلب قائمة الدخل
export async function getIncomeStatement() {
  const res = await axios.get(`${API_URL}/income_statement`);
  return res.data;
}

// جلب الميزانية العمومية
export async function getBalanceSheet() {
  const res = await axios.get(`${API_URL}/balance_sheet`);
  return res.data;
}

// ================== JournalEntry CRUD ==================
// حذف قيد يومية
export async function deleteJournalEntry(id) {
  const res = await axios.delete(`${API_URL}/journal_entries/${id}`);
  return res.data;
}

// تعديل قيد يومية
export async function updateJournalEntry(id, updated) {
  const res = await axios.put(`${API_URL}/journal_entries/${id}`, updated);
  return res.data;
}

// ================== TransactionLine CRUD ==================
// حذف سطر قيد
export async function deleteTransactionLine(id) {
  const res = await axios.delete(`${API_URL}/transaction_lines/${id}`);
  return res.data;
}

// تعديل سطر قيد
export async function updateTransactionLine(id, updated) {
  const res = await axios.put(`${API_URL}/transaction_lines/${id}`, updated);
  return res.data;
}
export async function getLedger(account_id = null) {
  let url = `${API_URL}/ledger`;
  if(account_id) url += `/${account_id}`;
  const res = await axios.get(url);
  return res.data;
}
export async function getExpenseAnalysis() {
  const response = await axios.get(`${API_URL}/expense_analysis`);
  return response.data;
}

// جلب الفواتير حسب المورد مع فلتر التاريخ
export const getInvoicesByVendor = async (vendorId, startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await axios.get(`${API_URL}/vendor_invoices/by_vendor/${vendorId}`, { params });
  return response.data;
};

// جلب الفواتير حسب القسم مع فلتر التاريخ
export const getInvoicesByDepartment = async (deptId, startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await axios.get(`${API_URL}/vendor_invoices/by_department/${deptId}`, { params });
  return response.data;
};
export async function getTransactionLinesWithVendor() {
  const res = await axios.get(`${API_URL}/transaction_lines_with_vendor`);
  return res.data;
}
// src/api/api.js
export async function createAdjustJournal(entry) {
  const res = await axios.post(`${API_URL}/adjust_journal_entry`, entry);
  return res.data;
}
