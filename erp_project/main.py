from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session,joinedload,aliased
from database.database import SessionLocal
from models import *
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from sqlalchemy import func, asc ,String
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

# السماح للـ frontend بالاتصال بالـ backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # رابط واجهتك React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    
)
# ---------------- DB session -----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- Employees ----------------
class EmployeeSchema(BaseModel):
    name: str
    phone: Optional [str]
    department_id: Optional[int]
    job_title: Optional[str]
    salary: float
    payment_method: Optional[str]
    net_salary: Optional[float] = 0.0 
class EmployeeResponse(EmployeeSchema):
    id: int
    salary_slips: List["SalarySlipResponse"] = []  # ← أضف هذه السطر
    bonuses: List["BonusResponse"] = []           # روابط الحوافز
    deductions: List["DeductionResponse"] = []   # روابط الخصومات
    net_salary: Optional[float] = 0.0 
    class Config:
        orm_mode = True

# ---------------- Departments ----------------
class DepartmentSchema(BaseModel):
    name: str
    description: Optional[str]

class DepartmentResponse(DepartmentSchema):
    id: int
    class Config:
        orm_mode = True

# ---------------- Attendance ----------------
class AttendanceSchema(BaseModel):
    employee_id: int
    date: str
    status: str

class AttendanceResponse(AttendanceSchema):
    id: int
    class Config:
        orm_mode = True

# ---------------- SalarySlip ----------------
class SalarySlipSchema(BaseModel):
    employee_id: int
    month: str
    total_salary_input: float
    bonuses: Optional[float] = 0.0
    deductions: Optional[float] = 0.0

class SalarySlipResponse(SalarySlipSchema):
    id: int
    base: float
    cost_of_living: float
    job_nature: float
    net_salary: float
    class Config:
        orm_mode = True

# ---------------- Deductions ----------------
class DeductionSchema(BaseModel):
    employee_id: int
    month: str
    amount: float
    reason: Optional[str]

class DeductionResponse(DeductionSchema):
    id: int
    class Config:
        orm_mode = True

# ---------------- Bonuses ----------------
class BonusSchema(BaseModel):
    employee_id: int
    month: str
    amount: float
    reason: Optional[str]

class BonusResponse(BonusSchema):
    id: int
    class Config:
        orm_mode = True


# ================== Accounting Schemas ==================
class AccountSchema(BaseModel):
    name: str
    code: str
    type: str
    parent_id: Optional[int] = None
    balance: float = 0.0

class AccountResponse(AccountSchema):
    id: int
    class Config:
        orm_mode = True


class JournalEntrySchema(BaseModel):
    date: date
    description: Optional[str]

class JournalEntryResponse(JournalEntrySchema):
    id: int
    class Config:
        orm_mode = True

class TransactionLineSchema(BaseModel):
    journal_entry_id: int
    account_id: int
    debit: float = 0.0
    credit: float = 0.0

class TransactionLineResponse(BaseModel):
    id: int
    account_id: Optional[int]  # <- اجعلها اختيارية
    journal_entry_id: int
    debit: Optional[float] = 0
    credit: Optional[float] = 0
    entry_desc: Optional[str] = None
    account_name: Optional[str] = None
    vendor_name: Optional[str] = None

    class Config:
        orm_mode = True

# ================== Inventory Schemas ==================
class ProductSchema(BaseModel):
    name: str
    description: Optional[str] = None
    quantity_on_hand: Optional[float] = 0.0
    reorder_level: Optional[float] = 0.0
    is_daily_consumable: Optional[bool] = False


class ProductResponse(ProductSchema):
    id: int
    class Config:
        orm_mode = True

class WarehouseSchema(BaseModel):
    name: str
    location: Optional[str]

class WarehouseResponse(WarehouseSchema):
    id: int
    class Config:
        orm_mode = True
from pydantic import BaseModel
from datetime import date

class StockMoveSchema(BaseModel):
    product_id: int
    warehouse_id: int
    date: date
    quantity: float
    move_type: str  # "in" or "out"
    reference: str | None = None
    purpose: str | None = None
    department_id: int 
    
class StockMoveResponse(StockMoveSchema):
    id: int

    class Config:
        orm_mode = True

    

# ================== Payments Schemas ==================
class PaymentSchema(BaseModel):
    vendor_id: int
    date: date
    amount: float
    account_id: Optional[int] = None  # ← أصبح اختياري
    reference: Optional[str] = None

class PaymentResponse(PaymentSchema):
    id: int
    journal_entry_id: Optional[int]  # ← هذا اختياري بالفعل
    class Config:
        orm_mode = True

class StockMoveResponse(StockMoveSchema):
    id: int
    class Config:
        orm_mode = True

class DailyExpenseSchema(BaseModel):
    amount: float
    description: str
    expense_account_id: int
    credit_account_id: int

# ================== Purchasing Schemas ==================
class VendorSchema(BaseModel):
    name: str
    contact: Optional[str]

class VendorResponse(VendorSchema):
    id: int
    class Config:
        orm_mode = True

class PurchaseOrderSchema(BaseModel):
    vendor_id: int
    date: date
    status: Optional[str] = "draft"

class PurchaseOrderResponse(PurchaseOrderSchema):
    id: int
    class Config:
        orm_mode = True

class PurchaseOrderLineSchema(BaseModel):
    order_id: int
    product_id: int
    quantity: float
    unit_price: float

class PurchaseOrderLineResponse(PurchaseOrderLineSchema):
    id: int
    class Config:
        orm_mode = True

# سطر تفاصيل الفاتورة (Line)
class VendorInvoiceLineSchema(BaseModel):
    product_name: str
    quantity: float
    unit_price: float

class VendorInvoiceLineResponse(VendorInvoiceLineSchema):
    product_name: str 
    quantity: float
    unit_price: float
    subtotal: float
    class Config:
        orm_mode = True


# الفاتورة الرئيسية
class VendorInvoiceSchema(BaseModel):
    vendor_id: int
    department_id: Optional[int]
    date: date
    total: float
    lines: List[VendorInvoiceLineSchema] = []

class VendorInvoiceResponse(VendorInvoiceSchema):
    id: int
    vendor_name: Optional[str] = None
    department_name: Optional[str] = None
    lines: List[VendorInvoiceLineResponse] = []

    class Config:
        orm_mode = True

# ================== Assets Schemas ==================
class AssetSchema(BaseModel):
    name: str
    purchase_date: Optional[date]
    cost: float
    depreciation_rate: float

class AssetResponse(AssetSchema):
    id: int
    class Config:
        orm_mode = True

class DepreciationLineSchema(BaseModel):
    asset_id: int
    date: date
    amount: float

class DepreciationLineResponse(DepreciationLineSchema):
    id: int
    class Config:
        orm_mode = True
        
# ----- عناصر الفاتورة -----
class SalesInvoiceItemSchema(BaseModel):
    product_id: int
    quantity: float
    price: float

class SalesInvoiceSchema(BaseModel):
    customer_name: str
    date: date
    total: float
    department_id: int
    items: List[SalesInvoiceItemSchema]

# ----- Response Schemas -----
class SalesInvoiceItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float
    price: float
    class Config:
        orm_mode = True

class SalesInvoiceResponse(BaseModel):
    id: int
    customer_name: str
    date: date
    total: float
    department_id: int
    items: List[SalesInvoiceItemResponse] = []
    journal_entry_id: Optional[int] = None
    class Config:
        orm_mode = True

class AdjustTransactionLineSchema(BaseModel):
    account_id: int
    debit: float = 0
    credit: float = 0

class AdjustJournalEntrySchema(BaseModel):
    date: date
    description: str
    lines: List[AdjustTransactionLineSchema]

# --------------------- CRUD Operations ---------------------

# ---------------- Salary Calculation -----------------
def calculate_salary(total_salary_input, bonuses=0.0, deductions=0.0):
    base = total_salary_input * 0.065
    cost_of_living = total_salary_input * 0.085
    job_nature = total_salary_input * 0.85
    net_salary = base + cost_of_living + job_nature + bonuses - deductions
    return {
        "base": base,
        "cost_of_living": cost_of_living,
        "job_nature": job_nature,
        "net_salary": net_salary
    }

def get_employee_salary(employee_id: int, db: Session, month: Optional[str] = None):
    emp = db.get(Employee, employee_id)
    if not emp:
        return None

    current_month = month or date.today().strftime("%Y-%m")

    total_bonuses = db.query(func.coalesce(func.sum(Bonus.amount), 0.0)).filter(
        Bonus.employee_id == employee_id,
        Bonus.month == current_month
    ).scalar()

    total_deductions = db.query(func.coalesce(func.sum(Deduction.amount), 0.0)).filter(
        Deduction.employee_id == employee_id,
        Deduction.month == current_month
    ).scalar()

    return calculate_salary(float(emp.salary), bonuses=total_bonuses, deductions=total_deductions)


# ---------------- Employee CRUD -----------------
@app.get("/employees", response_model=List[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    return db.query(Employee).all()

@app.post("/employees", response_model=EmployeeResponse)
def create_employee(employee: EmployeeSchema, db: Session = Depends(get_db)):
    emp = Employee(**employee.dict())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp

@app.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: int, updated: EmployeeSchema, db: Session = Depends(get_db)):
    emp = db.get(Employee, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    for key, value in updated.dict().items():
        setattr(emp, key, value)
    db.commit()
    db.refresh(emp)
    return emp

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.get(Employee, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return {"detail": "Employee deleted"}


# ---------------- Bonuses CRUD -----------------
@app.get("/bonuses", response_model=List[BonusResponse])
def get_bonuses(db: Session = Depends(get_db)):
    return db.query(Bonus).all()

@app.post("/bonuses", response_model=BonusResponse)
def create_bonus(bonus: BonusSchema, db: Session = Depends(get_db)):
    b = Bonus(**bonus.dict())
    db.add(b)
    db.commit()
    db.refresh(b)
    return b

@app.put("/bonuses/{bonus_id}", response_model=BonusResponse)
def update_bonus(bonus_id: int, bonus: BonusSchema, db: Session = Depends(get_db)):
    b = db.get(Bonus, bonus_id)
    if not b:
        raise HTTPException(status_code=404, detail="Bonus not found")
    for key, value in bonus.dict().items():
        setattr(b, key, value)
    db.commit()
    db.refresh(b)
    return b

@app.delete("/bonuses/{bonus_id}")
def delete_bonus(bonus_id: int, db: Session = Depends(get_db)):
    b = db.get(Bonus, bonus_id)
    if not b:
        raise HTTPException(status_code=404, detail="Bonus not found")
    db.delete(b)
    db.commit()
    return {"detail": "Bonus deleted"}


# ---------------- Deductions CRUD -----------------
@app.get("/deductions", response_model=List[DeductionResponse])
def get_deductions(db: Session = Depends(get_db)):
    return db.query(Deduction).all()

@app.post("/deductions", response_model=DeductionResponse)
def create_deduction(deduction: DeductionSchema, db: Session = Depends(get_db)):
    d = Deduction(**deduction.dict())
    db.add(d)
    db.commit()
    db.refresh(d)
    return d

@app.put("/deductions/{deduction_id}", response_model=DeductionResponse)
def update_deduction(deduction_id: int, deduction: DeductionSchema, db: Session = Depends(get_db)):
    d = db.get(Deduction, deduction_id)
    if not d:
        raise HTTPException(status_code=404, detail="Deduction not found")
    for key, value in deduction.dict().items():
        setattr(d, key, value)
    db.commit()
    db.refresh(d)
    return d

@app.delete("/deductions/{deduction_id}")
def delete_deduction(deduction_id: int, db: Session = Depends(get_db)):
    d = db.get(Deduction, deduction_id)
    if not d:
        raise HTTPException(status_code=404, detail="Deduction not found")
    db.delete(d)
    db.commit()
    return {"detail": "Deduction deleted"}


# ---------------- Salary Slip Calculated on Demand -----------------
@app.get("/salary_slips/{employee_id}/{month}")
def salary_slip(employee_id: int, month: str, db: Session = Depends(get_db)):
    slip = get_employee_salary(employee_id, db, month)
    if not slip:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {
        "employee_id": employee_id,
        "month": month,
        **slip
    }
# ---------------- Departments CRUD ----------------
@app.get("/departments", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@app.post("/departments", response_model=DepartmentResponse)
def create_department(dept: DepartmentSchema, db: Session = Depends(get_db)):
    d = Department(**dept.dict())
    db.add(d)
    db.commit()
    db.refresh(d)
    return d

@app.put("/departments/{dept_id}", response_model=DepartmentResponse)
def update_department(dept_id: int, dept: DepartmentSchema, db: Session = Depends(get_db)):
    d = db.query(Department).get(dept_id)
    if not d:
        raise HTTPException(status_code=404, detail="Department not found")
    for key, value in dept.dict().items():
        setattr(d, key, value)
    db.commit()
    db.refresh(d)
    return d

@app.delete("/departments/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db)):
    d = db.query(Department).get(dept_id)
    if not d:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(d)
    db.commit()
    return {"detail": "Department deleted"}

# ---------------- Attendance CRUD ----------------
@app.get("/attendances", response_model=List[AttendanceResponse])
def get_attendances(db: Session = Depends(get_db)):
    return db.query(Attendance).all()

@app.post("/attendances", response_model=AttendanceResponse)
def create_attendance(att: AttendanceSchema, db: Session = Depends(get_db)):
    a = Attendance(**att.dict())
    db.add(a)
    db.commit()
    db.refresh(a)
    return a

# ------------------- Accounting CRUD -------------------


@app.get("/accounts")
def get_accounts(db: Session = Depends(get_db)):
    accounts = db.query(
        Account.id,
        Account.name,
        Account.code,
        Account.type,
        Account.parent_id,
        func.coalesce(func.sum(TransactionLine.debit), 0).label("total_debit"),
        func.coalesce(func.sum(TransactionLine.credit), 0).label("total_credit"),
    ).outerjoin(TransactionLine, TransactionLine.account_id == Account.id).group_by(  Account.id,
    Account.name,
    Account.code,
    Account.type,
    Account.parent_id).all()

    result = []
    for acc in accounts:
        # الرصيد الطبيعي حسب نوع الحساب
        if acc.type in ["Asset", "Expense"]:
            balance = acc.total_debit - acc.total_credit
        else:  # Liability, Revenue, Equity
            balance = acc.total_credit - acc.total_debit
        result.append({
            "id": acc.id,
            "code": acc.code,
            "name": acc.name,
            "type": acc.type,
            "parent_id": acc.parent_id,
            "balance": balance
        })
    return result

@app.post("/accounts", response_model=AccountResponse)
def create_account(account: AccountSchema, db: Session = Depends(get_db)):
    acc = Account(**account.dict())
    db.add(acc)
    db.commit()
    db.refresh(acc)

    if acc.balance > 0:
        entry = JournalEntry(
            date=date.today(),
            description=f"قيد افتتاحي للحساب {acc.name}"
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)

        if acc.type in ["Asset", "Expense"]:
            debit = acc.balance
            credit = 0
        else:  # Liability, Revenue, Equity
            debit = 0
            credit = acc.balance

        line = TransactionLine(
            journal_entry_id=entry.id,
            account_id=acc.id,
            debit=debit,
            credit=credit
        )
        db.add(line)
        db.commit()

    return acc

@app.put("/accounts/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, updated: AccountSchema, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    for field, value in updated.dict().items():
        setattr(acc, field, value)
    db.commit()
    db.refresh(acc)
    return acc
@app.delete("/accounts/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(acc)
    db.commit()
    return {"message": "Account deleted"}

@app.get("/journal_entries", response_model=List[JournalEntryResponse])
def get_journal_entries(db: Session = Depends(get_db)):
    return db.query(JournalEntry).all()

@app.post("/journal_entries", response_model=JournalEntryResponse)
def create_journal_entry(entry: JournalEntrySchema, db: Session = Depends(get_db)):
    j = JournalEntry(**entry.dict())
    db.add(j)
    db.commit()
    db.refresh(j)
    return j

@app.get("/transaction_lines")
def get_transaction_lines(db: Session = Depends(get_db)):
    VendorAlias = aliased(Vendor)

    lines = (
        db.query(
            TransactionLine.id,
            TransactionLine.journal_entry_id,
            TransactionLine.debit,
            TransactionLine.credit,
            Account.name.label("account_name"),
            JournalEntry.date.label("entry_date"),
            JournalEntry.description.label("entry_desc"),
            func.coalesce(VendorAlias.name, Vendor.name).label("vendor_name"),
            Account.id.label("account_id")
        )
        .join(Account, Account.id == TransactionLine.account_id)
        .join(JournalEntry, JournalEntry.id == TransactionLine.journal_entry_id)
        .outerjoin(Payment, Payment.journal_entry_id == JournalEntry.id)
        .outerjoin(VendorAlias, VendorAlias.id == Payment.vendor_id)
        .outerjoin(VendorInvoice, VendorInvoice.id == JournalEntry.id)  # ربط إضافي مع الفواتير
        .outerjoin(Vendor, Vendor.id == VendorInvoice.vendor_id)
        .order_by(asc(JournalEntry.date), asc(TransactionLine.id))
        .all()
    )

    balances = {}
    ledger_data = []

    for r in lines:
        acc_id = r.account_id
        balances.setdefault(acc_id, 0)
        balances[acc_id] += (r.debit or 0) - (r.credit or 0)
        ledger_data.append({
            "id": r.id,
            "journal_entry_id": r.journal_entry_id,
            "date": r.entry_date,
            "entry_desc": r.entry_desc,
            "account_name": r.account_name,
            "vendor_name": r.vendor_name,
            "debit": r.debit,
            "credit": r.credit,
            "balance": balances[acc_id],
        })

    return ledger_data

@app.get("/transaction_lines_with_vendor")
def get_transaction_lines_with_vendor(db: Session = Depends(get_db)):
    lines = db.query(TransactionLine).all()
    result = []

    for line in lines:
        vendor_name = None

        # ✅ البحث عن فاتورة مرتبطة بنفس رقم القيد (الربط الجديد)
        vi = db.query(VendorInvoice).filter(VendorInvoice.journal_entry_id == line.journal_entry_id).first()
        if vi and vi.vendor:
            vendor_name = vi.vendor.name

        # ✅ إذا لم توجد فاتورة، نبحث عن دفعة مرتبطة بالقيد
        if not vendor_name:
            payment = db.query(Payment).filter(Payment.journal_entry_id == line.journal_entry_id).first()
            if payment and payment.vendor:
                vendor_name = payment.vendor.name

        result.append({
            "id": line.id,
            "journal_entry_id": line.journal_entry_id,
            "account_id": line.account_id,
            "account_name": line.account.name if line.account else None,
            "date": line.journal_entry.date if line.journal_entry else None,
            "entry_desc": line.journal_entry.description if line.journal_entry else None,
            "debit": line.debit,
            "credit": line.credit,
            "balance": 0,  # سيتم حسابه في الفرونت
            "vendor_name": vendor_name
        })

    return result

# ------------------- Inventory CRUD -------------------
@app.get("/products", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@app.post("/products", response_model=ProductResponse)
def create_product(product: ProductSchema, db: Session = Depends(get_db)):
    p = Product(**product.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@app.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductSchema, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.dict().items():
        setattr(p, key, value)
    db.commit()
    db.refresh(p)
    return p

@app.get("/warehouses", response_model=List[WarehouseResponse])
def get_warehouses(db: Session = Depends(get_db)):
    return db.query(Warehouse).all()

@app.post("/warehouses", response_model=WarehouseResponse)
def create_warehouse(wh: WarehouseSchema, db: Session = Depends(get_db)):
    w = Warehouse(**wh.dict())
    db.add(w)
    db.commit()
    db.refresh(w)
    return w

@app.get("/vendor_invoices", response_model=List[VendorInvoiceResponse])
def get_vendor_invoices(db: Session = Depends(get_db)):
    """
    جلب كل الفواتير السابقة مع خطوطها، اسم المورد واسم القسم.
    الفواتير اليومية تستخدم product_name بدل product_id.
    """
    # جلب كل الفواتير مع العلاقات المطلوبة
    invoices = (
        db.query(VendorInvoice)
        .options(
            joinedload(VendorInvoice.lines),
            joinedload(VendorInvoice.vendor),
            joinedload(VendorInvoice.department)
        )
        .all()
    )

    result = []
    for inv in invoices:
        # تجهيز خطوط الفاتورة
        invoice_lines = [
            VendorInvoiceLineResponse(
                id=line.id,
                product_name=line.product_name,
                quantity=line.quantity,
                unit_price=line.unit_price,
                subtotal=line.quantity * line.unit_price
            )
            for line in inv.lines
        ]

        # ملء أسماء المورد والقسم
        vendor_name = inv.vendor.name if inv.vendor else "غير محدد"
        department_name = inv.department.name if inv.department else "غير محدد"

        # تجهيز الفاتورة الكاملة
        result.append(VendorInvoiceResponse(
            id=inv.id,
            vendor_id=inv.vendor_id,
            department_id=inv.department_id,
            date=inv.date,
            total=inv.total,
            vendor_name=vendor_name,
            department_name=department_name,
            lines=invoice_lines
        ))

    return result

# ---------------- POST Vendor Invoice -----------------
# ---------------- POST Vendor Invoice -----------------
@app.post("/vendor_invoices_with_stock", response_model=VendorInvoiceResponse)
def create_vendor_invoice(
    inv: VendorInvoiceSchema,
    move_type: str = "consumable",  # "inventory" أو "consumable"
    db: Session = Depends(get_db)
):
    # 1️⃣ إنشاء القيد المحاسبي أولاً
    journal_entry = JournalEntry(
        date=inv.date,
        description=f"فاتورة {'مستهلكات' if move_type=='consumable' else 'مخزنية'} رقم مؤقت"
    )
    db.add(journal_entry)
    db.commit()
    db.refresh(journal_entry)

    # 2️⃣ إنشاء الفاتورة وربطها بالقيد
    invoice = VendorInvoice(
        vendor_id=inv.vendor_id,
        department_id=inv.department_id,
        date=inv.date,
        total=inv.total,
        journal_entry_id=journal_entry.id  # ✅ الربط المهم هنا
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    # 🔹 بعد إنشاء الفاتورة، نحدث وصف القيد ليحمل رقم الفاتورة الحقيقي
    journal_entry.description = f"فاتورة {'مستهلكات' if move_type=='consumable' else 'مخزنية'} رقم {invoice.id}"
    db.commit()

    # 3️⃣ إنشاء القيود المحاسبية
    expense_account = db.query(Account).filter(Account.name == "مستهلكات").first()
    if not expense_account:
        raise HTTPException(status_code=400, detail="حساب المصروف (مستهلكات) غير موجود")

    vendor_account = db.query(Account).filter(Account.name == "حساب الموردين").first()
    if not vendor_account:
        raise HTTPException(status_code=400, detail="حساب المورد (حساب الموردين) غير موجود")

    # سطر مدين → المصروف
    t1 = TransactionLine(
        journal_entry_id=journal_entry.id,
        account_id=expense_account.id,
        debit=inv.total,
        credit=0.0
    )

    # سطر دائن → المورد
    t2 = TransactionLine(
        journal_entry_id=journal_entry.id,
        account_id=vendor_account.id,
        debit=0.0,
        credit=inv.total
    )
    db.add_all([t1, t2])
    db.commit()

    # 4️⃣ إضافة سطور الفاتورة (المنتجات)
    invoice_lines_response = []
    for line in inv.lines:
        subtotal = line.quantity * line.unit_price
        line_obj = VendorInvoiceLine(
            invoice_id=invoice.id,
            product_name=line.product_name,
            quantity=line.quantity,
            unit_price=line.unit_price,
        )
        db.add(line_obj)

        invoice_lines_response.append({
            "id": line_obj.id,
            "product_name": line.product_name,
            "quantity": line.quantity,
            "unit_price": line.unit_price,
            "subtotal": subtotal
        })

    db.commit()
    db.refresh(invoice)

    # 5️⃣ إضافة العلاقات ORM
    invoice.lines = db.query(VendorInvoiceLine).filter(VendorInvoiceLine.invoice_id == invoice.id).all()

    return invoice

# ---------------- DELETE Vendor Invoice -----------------
@app.delete("/vendor_invoices/{invoice_id}")
def delete_vendor_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(VendorInvoice).filter(VendorInvoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # 🔹 ابحث عن القيد المحاسبي المرتبط بالفاتورة
    journal = db.query(JournalEntry).filter(
        JournalEntry.description.like(f"%فاتورة%{invoice_id}%")
    ).first()

    if journal:
        # حذف سطور القيد
        db.query(TransactionLine).filter(TransactionLine.journal_entry_id == journal.id).delete()
        # حذف القيد نفسه
        db.delete(journal)

    # حذف خطوط الفاتورة
    db.query(VendorInvoiceLine).filter(VendorInvoiceLine.invoice_id == invoice.id).delete()

    # حذف الفاتورة نفسها
    db.delete(invoice)
    db.commit()

    return {"detail": f"Invoice {invoice_id} and related journal entry deleted successfully ✅"}




from fastapi import Query
from datetime import date

# ---------------- GET Vendor Invoices by Vendor (with date filter) -----------------
@app.get("/vendor_invoices/by_vendor/{vendor_id}", response_model=List[VendorInvoiceResponse])
def get_vendor_invoices_by_vendor(
    vendor_id: int,
    start_date: date = Query(None, description="تاريخ البداية"),
    end_date: date = Query(None, description="تاريخ النهاية"),
    db: Session = Depends(get_db)
):
    query = (
        db.query(VendorInvoice)
        .options(
            joinedload(VendorInvoice.vendor),
            joinedload(VendorInvoice.department),
            joinedload(VendorInvoice.lines)
        )
        .filter(VendorInvoice.vendor_id == vendor_id)
    )

    if start_date:
        query = query.filter(VendorInvoice.date >= start_date)
    if end_date:
        query = query.filter(VendorInvoice.date <= end_date)

    invoices = query.all()
    if not invoices:
        raise HTTPException(status_code=404, detail="لا توجد فواتير لهذا المورد في هذه الفترة")

    result = []
    for invoice in invoices:
        lines = [
            {
                "id": line.id,
                "product_name": line.product_name,
                "quantity": line.quantity,
                "unit_price": line.unit_price,
                "subtotal": line.quantity * line.unit_price
            }
            for line in invoice.lines
        ]

        result.append(VendorInvoiceResponse(
            id=invoice.id,
            vendor_id=invoice.vendor_id,
            department_id=invoice.department_id,
            date=invoice.date,
            total=invoice.total,
            vendor_name=invoice.vendor.name if invoice.vendor else None,
            department_name=invoice.department.name if invoice.department else None,
            lines=lines
        ))
    return result


# ---------------- GET Vendor Invoices by Department (with date filter) -----------------
@app.get("/vendor_invoices/by_department/{department_id}", response_model=List[VendorInvoiceResponse])
def get_invoices_by_department(
    department_id: int,
    start_date: date = Query(None, description="تاريخ البداية"),
    end_date: date = Query(None, description="تاريخ النهاية"),
    db: Session = Depends(get_db)
):
    query = (
        db.query(VendorInvoice)
        .options(
            joinedload(VendorInvoice.vendor),
            joinedload(VendorInvoice.department),
            joinedload(VendorInvoice.lines)
        )
        .filter(VendorInvoice.department_id == department_id)
    )

    if start_date:
        query = query.filter(VendorInvoice.date >= start_date)
    if end_date:
        query = query.filter(VendorInvoice.date <= end_date)

    invoices = query.all()
    if not invoices:
        raise HTTPException(status_code=404, detail="لا توجد فواتير لهذا القسم في هذه الفترة")

    result = []
    for invoice in invoices:
        lines = [
            {
                "id": line.id,
                "product_name": line.product_name,
                "quantity": line.quantity,
                "unit_price": line.unit_price,
                "subtotal": line.quantity * line.unit_price
            }
            for line in invoice.lines
        ]

        result.append(VendorInvoiceResponse(
            id=invoice.id,
            vendor_id=invoice.vendor_id,
            department_id=invoice.department_id,
            date=invoice.date,
            total=invoice.total,
            vendor_name=invoice.vendor.name if invoice.vendor else None,
            department_name=invoice.department.name if invoice.department else None,
            lines=lines
        ))
    return result

# ---------------- Stock Moves ----------------
@app.get("/stock_moves", response_model=list)
def get_stock_moves(db: Session = Depends(get_db)):
    """عرض كل حركات المخزون مع اسم المنتج واسم القسم وحالة المخزون الحالية"""
    moves = db.query(StockMove).all()
    result = []
    for m in moves:
        product = db.query(Product).filter(Product.id == m.product_id).first()
        department = db.query(Department).filter(Department.id == m.department_id).first() if m.department_id else None
        current_qty = product.quantity_on_hand if product else None
        low_stock_alert = (product.quantity_on_hand < product.reorder_level) if product else False
        result.append({
            "id": m.id,
            "product_id": m.product_id,
            "product_name": product.name if product else None,
            "warehouse_id": m.warehouse_id,
            "department_id": m.department_id,
            "department_name": department.name if department else None,
            "date": m.date,
            "quantity": m.quantity,
            "move_type": m.move_type,
            "reference": m.reference,
            "purpose": m.purpose,
            "current_quantity": current_qty,
            "low_stock_alert": low_stock_alert,
            "reorder_level": product.reorder_level if product else None
        })
    return result


@app.post("/stock_moves", response_model=dict)
def create_stock_move(move: StockMoveSchema, db: Session = Depends(get_db)):
    """إضافة حركة مخزون جديدة مع إرجاع اسم المنتج والقسم"""
    product = db.query(Product).filter(Product.id == move.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")

    # تعديل الكمية حسب نوع الحركة
    if move.move_type == "in":
        product.quantity_on_hand += move.quantity
    elif move.move_type == "out":
        product.quantity_on_hand -= move.quantity
        if product.quantity_on_hand < 0:
            product.quantity_on_hand = 0
    else:
        raise HTTPException(status_code=400, detail="move_type يجب أن يكون 'in' أو 'out'")

    # إنشاء الحركة
    stock_move = StockMove(
        product_id=move.product_id,
        warehouse_id=move.warehouse_id,
        department_id=move.department_id,
        date=move.date,
        quantity=move.quantity,
        move_type=move.move_type,
        reference=move.reference,
        purpose=move.purpose,
    )

    db.add(stock_move)
    db.commit()
    db.refresh(stock_move)
    db.refresh(product)

    # جلب اسم القسم
    dep_name = None
    if move.department_id:
        dep = db.query(Department).filter(Department.id == move.department_id).first()
        dep_name = dep.name if dep else None

    low_stock_alert = product.quantity_on_hand < (product.reorder_level or 0)

    return {
        "id": stock_move.id,
        "product_id": stock_move.product_id,
        "product_name": product.name,
        "department_id": move.department_id,
        "department_name": dep_name,  # 👈 هذا هو المفتاح المهم
        "move_type": move.move_type,
        "quantity": move.quantity,
        "reference": move.reference,
        "date": move.date,
        "purpose": move.purpose,
        "current_quantity": product.quantity_on_hand,
        "reorder_level": product.reorder_level,
        "low_stock_alert": low_stock_alert,
    }


# ------------------- Inventory Report -------------------
@app.get("/inventory_report")
def inventory_report(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    report = []
    for p in products:
        low_stock_alert = p.quantity_on_hand < p.reorder_level
        report.append({
            "product_id": p.id,
            "name": p.name,
            "quantity_on_hand": p.quantity_on_hand,
            "reorder_level": p.reorder_level,
            "is_daily_consumable": p.is_daily_consumable,
            "low_stock_alert": low_stock_alert
        })
    return report

# ------------------- Purchasing CRUD -------------------
@app.get("/vendors", response_model=List[VendorResponse])
def get_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()

@app.post("/vendors", response_model=VendorResponse)
def create_vendor(vendor: VendorSchema, db: Session = Depends(get_db)):
    v = Vendor(**vendor.dict())
    db.add(v)
    db.commit()
    db.refresh(v)
    return v

@app.get("/purchase_orders", response_model=List[PurchaseOrderResponse])
def get_purchase_orders(db: Session = Depends(get_db)):
    return db.query(PurchaseOrder).all()

@app.post("/purchase_orders", response_model=PurchaseOrderResponse)
def create_purchase_order(po: PurchaseOrderSchema, db: Session = Depends(get_db)):
    p = PurchaseOrder(**po.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@app.get("/purchase_order_lines", response_model=List[PurchaseOrderLineResponse])
def get_purchase_order_lines(db: Session = Depends(get_db)):
    return db.query(PurchaseOrderLine).all()

@app.post("/purchase_order_lines", response_model=PurchaseOrderLineResponse)
def create_purchase_order_line(line: PurchaseOrderLineSchema, db: Session = Depends(get_db)):
    l = PurchaseOrderLine(**line.dict())
    db.add(l)
    db.commit()
    db.refresh(l)
    return l

@app.get("/vendor_invoices/by_vendor/{vendor_id}")
def get_invoices_by_vendor(vendor_id: int, db: Session = Depends(get_db)):
    invoices = (
        db.query(VendorInvoice)
        .options(
            joinedload(VendorInvoice.vendor),
            joinedload(VendorInvoice.department),
            joinedload(VendorInvoice.lines)
        )
        .filter(VendorInvoice.vendor_id == vendor_id)
        .all()
    )

    if not invoices:
        raise HTTPException(status_code=404, detail="لا توجد فواتير لهذا المورد")

    result = []
    for inv in invoices:
        result.append({
            "id": inv.id,
            "date": inv.date,
            "total": inv.total,
            "vendor": inv.vendor.name if inv.vendor else None,
            "department": inv.department.name if inv.department else None,
            "lines": [
                {
                    "product_id": line.product_id,
                    "quantity": line.quantity,
                    "unit_price": line.unit_price,
                    "subtotal": line.quantity * line.unit_price
                }
                for line in inv.lines
            ]
        })
    return result

# ------------------- Assets CRUD -------------------
@app.get("/assets", response_model=List[AssetResponse])
def get_assets(db: Session = Depends(get_db)):
    return db.query(Asset).all()

@app.post("/assets", response_model=AssetResponse)
def create_asset(asset: AssetSchema, db: Session = Depends(get_db)):
    a = Asset(**asset.dict())
    db.add(a)
    db.commit()
    db.refresh(a)
    return a

@app.get("/depreciation_lines", response_model=List[DepreciationLineResponse])
def get_depreciation_lines(db: Session = Depends(get_db)):
    return db.query(DepreciationLine).all()

@app.post("/depreciation_lines", response_model=DepreciationLineResponse)
def create_depreciation_line(line: DepreciationLineSchema, db: Session = Depends(get_db)):
    l = DepreciationLine(**line.dict())
    db.add(l)
    db.commit()
    db.refresh(l)
    return l
# ------------------- Payments CRUD -------------------
@app.get("/payments", response_model=List[PaymentResponse])
def get_payments(db: Session = Depends(get_db)):
    return db.query(Payment).all()
@app.post("/payments", response_model=PaymentResponse)
def create_payment(payment: PaymentSchema, db: Session = Depends(get_db)):

    # 1️⃣ إنشاء قيد يومية
    journal_entry = JournalEntry(
        date=payment.date,
        description=f"دفعة لمورد {payment.vendor_id} - {payment.reference or ''}",
       
    )
    db.add(journal_entry)
    db.commit()
    db.refresh(journal_entry)

    # 2️⃣ حساب الموردين
    vendor_account = db.query(Account).filter(Account.name == "حساب الموردين").first()
    if not vendor_account:
        raise HTTPException(status_code=400, detail="Accounts Payable account not found")

    t1 = TransactionLine(
        journal_entry_id=journal_entry.id,
        account_id=vendor_account.id,
        debit=payment.amount,
        credit=0.0
    )

    # 3️⃣ الحساب المختار
    user_account = db.get(Account, payment.account_id)
    if not user_account:
        raise HTTPException(status_code=400, detail="Selected account not found")

    t2 = TransactionLine(
        journal_entry_id=journal_entry.id,
        account_id=user_account.id,
        debit=0.0,
        credit=payment.amount
    )

    db.add_all([t1, t2])
    db.commit()

    # 4️⃣ حفظ الدفعة نفسها (✔️ مع account_id و reference)
    p = Payment(
        vendor_id=payment.vendor_id,
        date=payment.date,
        amount=payment.amount,
        journal_entry_id=journal_entry.id,
        account_id=payment.account_id,
        reference=payment.reference
    )
    db.add(p)
    db.commit()
    db.refresh(p)




    # 5️⃣ جلب اسم المورد واسم الحساب لعرضه في Ledger مباشرة
    vendor = db.get(Vendor, payment.vendor_id)
    return {
        "id": p.id,
        "vendor_id": p.vendor_id,
        "vendor_name": vendor.name if vendor else None,  # اسم المورد الصحيح
        "date": p.date,
        "amount": p.amount,
        "journal_entry_id": p.journal_entry_id,
        "account_id": payment.account_id,
        "account_name": user_account.name  # اسم الحساب المستخدم
    }


@app.delete("/payments/{payment_id}")
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # حذف القيد المرتبط بالدفعة إن وجد
    journal = db.query(JournalEntry).filter(JournalEntry.id == payment.journal_entry_id).first()
    if journal:
        db.query(TransactionLine).filter(TransactionLine.journal_entry_id == journal.id).delete()
        db.delete(journal)

    db.delete(payment)
    db.commit()
    return {"detail": f"Payment {payment_id} deleted successfully"}
# ------------------- Daily Expenses / Payroll -------------------

@app.post("/daily_expense")
def create_daily_expense(expense: DailyExpenseSchema, db: Session = Depends(get_db)):
    # إنشاء قيد اليومية
    journal_entry = JournalEntry(date=date.today(), description=expense.description)
    db.add(journal_entry)
    db.commit()
    db.refresh(journal_entry)

    # جلب الحسابات
    expense_account = db.get(Account, expense.expense_account_id)
    credit_account = db.get(Account, expense.credit_account_id)
    if not expense_account or not credit_account:
        raise HTTPException(status_code=400, detail="حساب المصروف أو الحساب الدائن غير موجود")

    # إنشاء سطور القيد
    t1 = TransactionLine(journal_entry_id=journal_entry.id, account_id=expense_account.id, debit=expense.amount, credit=0)
    t2 = TransactionLine(journal_entry_id=journal_entry.id, account_id=credit_account.id, debit=0, credit=expense.amount)
    db.add_all([t1, t2])
    db.commit()

    return {
        "detail": "مصروف مسجل بنجاح ✅",
        "journal_entry_id": journal_entry.id,
        "amount": expense.amount,
        "description": expense.description,
        "expense_account_id": expense.expense_account_id,
        "credit_account_id": expense.credit_account_id
    }

@app.get("/daily_expense")
def get_daily_expenses(db: Session = Depends(get_db)):
    # جلب كل القيود التي تحتوي على مدين > 0 (مصروفات)
    entries = db.query(JournalEntry).join(TransactionLine).filter(TransactionLine.debit > 0).all()
    result = []

    for e in entries:
        # جلب سطر المصروف وسطر الدائن لكل JournalEntry
        expense_line = db.query(TransactionLine).filter(
            TransactionLine.journal_entry_id == e.id,
            TransactionLine.debit > 0
        ).first()

        credit_line = db.query(TransactionLine).filter(
            TransactionLine.journal_entry_id == e.id,
            TransactionLine.credit > 0
        ).first()

        if expense_line and credit_line:
            result.append({
                "journal_entry_id": e.id,
                "description": e.description,
                "amount": expense_line.debit,
                "expense_account_id": expense_line.account_id,
                "credit_account_id": credit_line.account_id
            })
    return result


@app.delete("/daily_expense/{journal_entry_id}")

def delete_daily_expense(journal_entry_id: int, db: Session = Depends(get_db)):
    journal = db.query(JournalEntry).filter(JournalEntry.id == journal_entry_id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal Entry not found")
    
    # حذف كل سطور القيد المرتبطة
    db.query(TransactionLine).filter(TransactionLine.journal_entry_id == journal.id).delete()
    
    # حذف القيد نفسه
    db.delete(journal)
    db.commit()
    return {"detail": f"مصروف يومي أو راتب للقيد {journal_entry_id} تم حذفه بنجاح ✅"}



@app.get("/trial_balance")
def trial_balance(db: Session = Depends(get_db)):
    result = (
        db.query(
            Account.id,
            Account.name,
            func.coalesce(func.sum(TransactionLine.debit), 0).label("debit_total"),
            func.coalesce(func.sum(TransactionLine.credit), 0).label("credit_total")
        )
        .outerjoin(TransactionLine, TransactionLine.account_id == Account.id)
        .group_by(Account.id)
        .all()
    )
    return [{"id": r.id, "name": r.name, "debit": r.debit_total, "credit": r.credit_total} for r in result]
@app.get("/income_statement")
def income_statement(db: Session = Depends(get_db)):
    revenues = db.query(
        func.coalesce(func.sum(TransactionLine.credit - TransactionLine.debit), 0)
    ).join(Account).filter(Account.type == "Revenue").scalar()

    expenses = db.query(
        func.coalesce(func.sum(TransactionLine.debit - TransactionLine.credit), 0)
    ).join(Account).filter(Account.type == "Expense").scalar()

    net_income = revenues - expenses
    return {"revenues": revenues, "expenses": expenses, "net_income": net_income}
@app.get("/balance_sheet")
def balance_sheet(db: Session = Depends(get_db)):
    assets = db.query(
        func.coalesce(func.sum(TransactionLine.debit - TransactionLine.credit), 0)
    ).join(Account).filter(Account.type == "Asset").scalar()

    liabilities = db.query(
        func.coalesce(func.sum(TransactionLine.credit - TransactionLine.debit), 0)
    ).join(Account).filter(Account.type == "Liability").scalar()

    equity = db.query(
        func.coalesce(func.sum(TransactionLine.credit - TransactionLine.debit), 0)
    ).join(Account).filter(Account.type == "Equity").scalar()

    return {"assets": assets, "liabilities": liabilities, "equity": equity}


# ---------------- إنشاء فاتورة مبيعات ----------------
@app.post("/sales_invoices_with_stock", response_model=SalesInvoiceResponse)
def create_sales_invoice(invoice: SalesInvoiceSchema, warehouse_id: int = 1, db: Session = Depends(get_db)):
    # إنشاء الفاتورة
    si = SalesInvoice(
        customer_name=invoice.customer_name,
        date=invoice.date,
        total=invoice.total,
        department_id=invoice.department_id
    )
    db.add(si)
    db.commit()
    db.refresh(si)

    # إنشاء القيد اليومي تلقائي
    journal_entry = JournalEntry(
        date=invoice.date,
        description=f"فاتورة مبيعات رقم {si.id}"
    )
    db.add(journal_entry)
    db.commit()
    db.refresh(journal_entry)
    si.journal_entry_id = journal_entry.id

    # سطر مدين → حساب العميل
    customer_account = db.query(Account).filter(Account.name == "حسابات العملاء").first()
    if not customer_account:
        raise HTTPException(status_code=400, detail="حساب العملاء غير موجود")

    t1 = TransactionLine(
        journal_entry_id=journal_entry.id,
        account_id=customer_account.id,
        debit=invoice.total,
        credit=0.0
    )

    # سطر دائن → حساب المبيعات
    sales_account = db.query(Account).filter(Account.name == "ايرادات مبيعات").first()
    if not sales_account:
        raise HTTPException(status_code=400, detail="حساب المبيعات غير موجود")

    t2 = TransactionLine(
        journal_entry_id=journal_entry.id,
        account_id=sales_account.id,
        debit=0.0,
        credit=invoice.total
    )

    db.add_all([t1, t2])
    db.commit()

    # إضافة المنتجات وحركات المخزون
    for item in invoice.items:
        sii = SalesInvoiceItem(
            sales_invoice_id=si.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(sii)

        # خصم المخزون
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity_on_hand -= item.quantity
            if product.quantity_on_hand < 0:
                product.quantity_on_hand = 0

            stock_move = StockMove(
                product_id=item.product_id,
                warehouse_id=warehouse_id,
                date=invoice.date,
                quantity=item.quantity,
                move_type="out",
                reference=f"Sales Invoice {si.id}",
                department_id=invoice.department_id
            )
            db.add(stock_move)
    db.commit()
    db.refresh(si)
    return db.query(SalesInvoice).options(joinedload(SalesInvoice.items)).get(si.id)

# ---------------- جلب كل فواتير المبيعات ----------------
@app.get("/sales_invoices", response_model=List[SalesInvoiceResponse])
def get_sales_invoices(db: Session = Depends(get_db)):
    return db.query(SalesInvoice).options(joinedload(SalesInvoice.items)).all()

# ---------------- جلب فواتير حسب القسم ----------------
@app.get("/sales_invoices/by_department/{department_id}", response_model=List[SalesInvoiceResponse])
def get_sales_invoices_by_department(department_id: int, db: Session = Depends(get_db)):
    invoices = db.query(SalesInvoice).options(joinedload(SalesInvoice.items)).filter(
        SalesInvoice.department_id == department_id
    ).all()
    
    if not invoices:
        raise HTTPException(status_code=404, detail="لا توجد فواتير لهذا القسم")
    
    return invoices
@app.delete("/sales_invoices/{invoice_id}")
def delete_sales_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(SalesInvoice).filter(SalesInvoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="الفاتورة غير موجودة")

    journal_entry_id = invoice.journal_entry_id

    # 1️⃣ حذف حركات المخزون
    db.query(StockMove).filter(
        StockMove.reference == f"Sales Invoice {invoice.id}"
    ).delete()

    # 2️⃣ حذف عناصر الفاتورة
    db.query(SalesInvoiceItem).filter(
        SalesInvoiceItem.sales_invoice_id == invoice.id
    ).delete()

    # 3️⃣ فك الربط مع القيد المحاسبي
    invoice.journal_entry_id = None
    db.flush()  # مهم جدًا

    # 4️⃣ حذف الفاتورة
    db.delete(invoice)

    # 5️⃣ حذف القيود المحاسبية
    if journal_entry_id:
        db.query(TransactionLine).filter(
            TransactionLine.journal_entry_id == journal_entry_id
        ).delete()

        db.query(JournalEntry).filter(
            JournalEntry.id == journal_entry_id
        ).delete()

    db.commit()

    return {"detail": f"تم حذف فاتورة المبيعات {invoice_id} نهائيًا"}


@app.get("/expense_analysis")
def expense_analysis(db: Session = Depends(get_db)):
    """
    تحليل المصروفات حسب الحساب والشهر (يدعم PostgreSQL)
    """
    from sqlalchemy import extract, func

    expenses = (
        db.query(
            Account.name.label("account_name"),
            func.concat(
                func.cast(extract("year", JournalEntry.date), String),
                "-",
                func.lpad(func.cast(extract("month", JournalEntry.date), String), 2, "0")
            ).label("month"),
            func.sum(TransactionLine.debit - TransactionLine.credit).label("total")
        )
        .join(TransactionLine, Account.id == TransactionLine.account_id)
        .join(JournalEntry, JournalEntry.id == TransactionLine.journal_entry_id)
        .filter(Account.type == "Expense")
        .group_by("account_name", "month")
        .order_by("month")
        .all()
    )

    total_expenses = sum(e.total for e in expenses)

    result = {}
    for e in expenses:
        if e.account_name not in result:
            result[e.account_name] = []
        result[e.account_name].append({
            "month": e.month,
            "amount": e.total
        })

    return {
        "total_expenses": total_expenses,
        "by_account": result
    }
@app.post("/adjust_journal_entry", response_model=JournalEntryResponse)
def create_adjust_journal(entry: AdjustJournalEntrySchema, db: Session = Depends(get_db)):
    journal = JournalEntry(date=entry.date, description=entry.description)
    db.add(journal)
    db.commit()
    db.refresh(journal)
    for l in entry.lines:
        line = TransactionLine(
            journal_entry_id=journal.id,
            account_id=l.account_id,
            debit=l.debit,
            credit=l.credit
        )
        db.add(line)
    db.commit()
    return journal
