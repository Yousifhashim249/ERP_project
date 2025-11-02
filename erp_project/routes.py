from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from database.database import SessionLocal
from models import *
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

app = FastAPI()

# ---------------- DB session -----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================== HR Schemas ==================
class EmployeeSchema(BaseModel):
    name: str
    email: str
    position: Optional[str]
    salary: float

class EmployeeResponse(EmployeeSchema):
    id: int
    class Config:
        orm_mode = True

class AttendanceSchema(BaseModel):
    employee_id: int
    date: date
    status: str

class AttendanceResponse(AttendanceSchema):
    id: int
    class Config:
        orm_mode = True

class SalarySlipSchema(BaseModel):
    employee_id: int
    month: str
    total: float

class SalarySlipResponse(SalarySlipSchema):
    id: int
    class Config:
        orm_mode = True

# ================== Accounting Schemas ==================
class AccountSchema(BaseModel):
    name: str
    type: str
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

class TransactionLineResponse(TransactionLineSchema):
    id: int
    class Config:
        orm_mode = True

# ================== Inventory Schemas ==================
class ProductSchema(BaseModel):
    name: str
    description: Optional[str]
    quantity_on_hand: float = 0.0

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

class StockMoveSchema(BaseModel):
    product_id: int
    warehouse_id: int
    date: date
    quantity: float
    move_type: str
    reference: Optional[str]

class StockMoveResponse(StockMoveSchema):
    id: int
    class Config:
        orm_mode = True

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

class VendorInvoiceSchema(BaseModel):
    vendor_id: int
    date: date
    total: float

class VendorInvoiceResponse(VendorInvoiceSchema):
    id: int
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

# --------------------- CRUD Operations ---------------------

# ------------------- HR CRUD -------------------
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

@app.get("/salary_slips", response_model=List[SalarySlipResponse])
def get_salary_slips(db: Session = Depends(get_db)):
    return db.query(SalarySlip).all()

@app.post("/salary_slips", response_model=SalarySlipResponse)
def create_salary_slip(slip: SalarySlipSchema, db: Session = Depends(get_db)):
    s = SalarySlip(**slip.dict())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

# ------------------- Accounting CRUD -------------------
@app.get("/accounts", response_model=List[AccountResponse])
def get_accounts(db: Session = Depends(get_db)):
    return db.query(Account).all()

@app.post("/accounts", response_model=AccountResponse)
def create_account(account: AccountSchema, db: Session = Depends(get_db)):
    acc = Account(**account.dict())
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc

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

@app.get("/transaction_lines", response_model=List[TransactionLineResponse])
def get_transaction_lines(db: Session = Depends(get_db)):
    return db.query(TransactionLine).all()

@app.post("/transaction_lines", response_model=TransactionLineResponse)
def create_transaction_line(line: TransactionLineSchema, db: Session = Depends(get_db)):
    t = TransactionLine(**line.dict())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

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

@app.get("/stock_moves", response_model=List[StockMoveResponse])
def get_stock_moves(db: Session = Depends(get_db)):
    return db.query(StockMove).all()

@app.post("/stock_moves", response_model=StockMoveResponse)
def create_stock_move(move: StockMoveSchema, db: Session = Depends(get_db)):
    s = StockMove(**move.dict())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

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

@app.get("/vendor_invoices", response_model=List[VendorInvoiceResponse])
def get_vendor_invoices(db: Session = Depends(get_db)):
    return db.query(VendorInvoice).all()

@app.post("/vendor_invoices", response_model=VendorInvoiceResponse)
def create_vendor_invoice(inv: VendorInvoiceSchema, db: Session = Depends(get_db)):
    i = VendorInvoice(**inv.dict())
    db.add(i)
    db.commit()
    db.refresh(i)
    return i

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
