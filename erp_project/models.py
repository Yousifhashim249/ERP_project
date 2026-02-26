from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey,Numeric,Boolean,UniqueConstraint
from sqlalchemy.orm import relationship
from database.database import Base

# ==============================
# قسم المحاسبة Accounting
# ==============================
class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)  # مثل 1001, 2001...
    type = Column(String, nullable=False)  # Asset, Liability, Expense, Revenue, Equity
    parent_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    balance = Column(Float, default=0.0)

    parent = relationship("Account", remote_side=[id], backref="children")
    transaction_lines = relationship("TransactionLine", back_populates="account")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    description = Column(String)

    lines = relationship("TransactionLine", back_populates="journal_entry")


class TransactionLine(Base):
    __tablename__ = "transaction_lines"

    id = Column(Integer, primary_key=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"))
    debit = Column(Float, default=0.0)
    credit = Column(Float, default=0.0)

    journal_entry = relationship("JournalEntry", back_populates="lines")
    account = relationship("Account", back_populates="transaction_lines")


# ==============================
# قسم المخزون Inventory
# ==============================
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    quantity_on_hand = Column(Float, default=0.0)
    reorder_level = Column(Float, default=0.0)  # الحد الأدنى للتنبيه
    is_daily_consumable = Column(Boolean, default=False)  # لتمييز المشتريات اليومية

    stock_moves = relationship("StockMove", back_populates="product")
    purchase_lines = relationship("PurchaseOrderLine", back_populates="product")


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)

    stock_moves = relationship("StockMove", back_populates="warehouse")

class StockMove(Base):
    __tablename__ = "stock_moves"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    department_id = Column(Integer, ForeignKey("departments.id")) 
    date = Column(Date, nullable=False)
    quantity = Column(Float)
    move_type = Column(String)  # in / out
    reference = Column(String)
    purpose = Column(String, default="stock")

    product = relationship("Product", back_populates="stock_moves")
    warehouse = relationship("Warehouse", back_populates="stock_moves")
    department = relationship("Department", back_populates="stock_moves")  # <- يربط العلاقة

# ==============================
# قسم المشتريات Purchasing
# ==============================
class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact = Column(String)

    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")
    invoices = relationship("VendorInvoice", back_populates="vendor")

class VendorInvoiceLine(Base):
    __tablename__ = "vendor_invoice_lines"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("vendor_invoices.id"))
    product_name = Column(String, nullable=False) 
    quantity = Column(Float)
    unit_price = Column(Float)

    invoice = relationship("VendorInvoice", back_populates="lines")

    @property
    def subtotal(self):
        return (self.quantity or 0) * (self.unit_price or 0)

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    date = Column(Date, nullable=False)
    status = Column(String, default="draft")

    vendor = relationship("Vendor", back_populates="purchase_orders")
    lines = relationship("PurchaseOrderLine", back_populates="order")


class PurchaseOrderLine(Base):
    __tablename__ = "purchase_order_lines"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("purchase_orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)

    order = relationship("PurchaseOrder", back_populates="lines")
    product = relationship("Product", back_populates="purchase_lines")


class VendorInvoice(Base):
    __tablename__ = "vendor_invoices"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    date = Column(Date)
    total = Column(Float, default=0.0)
    department_id = Column(Integer, ForeignKey("departments.id"))
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id")) 
    
    department = relationship("Department", back_populates="vendor_invoices")
    vendor = relationship("Vendor", back_populates="invoices")     
    lines = relationship("VendorInvoiceLine", back_populates="invoice")
    journal_entry = relationship("JournalEntry") 
    # -------------------  قسم المبيعات -------------------
     # -------------------  قسم المبيعات -------------------
class SalesInvoice(Base):
    __tablename__ = "sales_invoices"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    total = Column(Float, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"))

    # العلاقات
    department = relationship("Department")  # 🔹 القسم المرتبط بالفاتورة
    journal_entry = relationship("JournalEntry")
    items = relationship("SalesInvoiceItem", back_populates="sales_invoice")  # 🔹 تفاصيل المنتجات المباعة
    
# ------------------- Sales Invoice Items -------------------
class SalesInvoiceItem(Base):
    __tablename__ = "sales_invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    sales_invoice_id = Column(Integer, ForeignKey("sales_invoices.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)

    # العلاقات
    product = relationship("Product")
    sales_invoice = relationship("SalesInvoice", back_populates="items")


# ==============================
# قسم الموظفين HR
# ==============================
class  Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    job_title = Column(String, nullable=True)
    salary = Column(Numeric(10, 2), default=0.0)
    payment_method = Column(String(255), nullable=True)
  # cash / bank_transfer / cheque

    department = relationship("Department", back_populates="employees")
    attendances = relationship("Attendance", back_populates="employee", cascade="all, delete")
    salary_slips = relationship("SalarySlip", back_populates="employee")
    deductions = relationship("Deduction", back_populates="employee",cascade="all, delete")  
    bonuses = relationship("Bonus", back_populates="employee")        


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date)
    status = Column(String)  # Present, Absent, Leave

    employee = relationship("Employee", back_populates="attendances")

class SalarySlip(Base):
    __tablename__ = "salary_slips"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    month = Column(String, nullable=False)
    total_salary_input = Column(Float, nullable=False)  
    base = Column(Float, default=0.0)              # الراتب الأساسي (6.5%)
    cost_of_living = Column(Float, default=0.0)    # غلاء المعيشة (8.5%)
    job_nature = Column(Float, default=0.0)        # طبيعة العمل (85%)
    bonuses = Column(Float, default=0.0)           # الحوافز
    deductions = Column(Float, default=0.0)        # الخصومات
    net_salary = Column(Float, default=0.0)        # الصافي بعد الخصومات والحوافز

    employee = relationship("Employee", back_populates="salary_slips")

class Deduction(Base):
    __tablename__ = "deductions"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id",ondelete="CASCADE"), nullable=False)
    month = Column(String, nullable=False)  # مثل "2025-10"
    amount = Column(Float, default=0.0)
    reason = Column(String, nullable=True)

    employee = relationship("Employee", back_populates="deductions")

  


class Bonus(Base):
    __tablename__ = "bonuses"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id",ondelete="CASCADE"), nullable=False)
    month = Column(String, nullable=False)
    amount = Column(Float, default=0.0)
    reason = Column(String, nullable=True)

    employee = relationship("Employee", back_populates="bonuses")

  



# ==============================
# قسم الأقسام Departments
# ==============================
class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)

    employees = relationship("Employee", back_populates="department")
    stock_moves = relationship("StockMove", back_populates="department")
    vendor_invoices = relationship("VendorInvoice", back_populates="department")
    

# ==============================
# قسم الأصول Assets
# ==============================
class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    purchase_date = Column(Date)
    cost = Column(Float)
    depreciation_rate = Column(Float)

    depreciations = relationship("DepreciationLine", back_populates="asset")


class DepreciationLine(Base):
    __tablename__ = "depreciation_lines"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    date = Column(Date)
    amount = Column(Float)

    asset = relationship("Asset", back_populates="depreciations")
# ============================== Payments ==============================
class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"))   # <- جديد
    reference = Column(String, nullable=True)                # <- جديد

    vendor = relationship("Vendor")
    journal_entry = relationship("JournalEntry")
    account = relationship("Account")