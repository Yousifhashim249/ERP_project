from database.database import SessionLocal
from models import Employee

db = SessionLocal()

# Add a new employee for testing
new_employee = Employee(
    name="Khalid Test",
    email="khalid.test@example.com",
    position="Developer",
    salary=5000.0
)
db.add(new_employee)
db.commit()
db.refresh(new_employee)
print("Employee added successfully:")
print(new_employee)

# Retrieve all employees to verify
employees = db.query(Employee).all()
print("All employees in the table:")
for emp in employees:
    print(emp.id, emp.name, emp.email, emp.position, emp.salary)

db.close()
