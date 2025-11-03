// src/App.jsx
import { useState, useEffect } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  createDepartment,
  deleteDepartment,
  getBonuses,
  createBonus,
  deleteBonus,
  getDeductions,
  createDeduction,
  deleteDeduction
} from "../api/api";

function App() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(""); // ✅ الشهر المختار
  const [activeTab, setActiveTab] = useState("employees");
  const [filterDept, setFilterDept] = useState("");


  const [newEmployee, setNewEmployee] = useState({
    name: "",
    phone: "",
    department_id: "",
    job_title: "",
    salary: 0,
    payment_method: ""
  });

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: ""
  });

  // ✅ حالات جديدة للحوافز والخصومات
  const [newBonus, setNewBonus] = useState({});
  const [newDeduction, setNewDeduction] = useState({});

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchBonuses();
    fetchDeductions();
  }, []);

  const fetchEmployees = async () => {
    const emps = await getEmployees();
    const empsWithNet = await Promise.all(
      emps.map(async (emp) => {
        try {
          const res = await fetch(
            `http://localhost:8000/salary_slips/${emp.id}/${new Date()
              .toISOString()
              .slice(0, 7)}`
          );
          const slip = await res.json();
          return {
            ...emp,
            base: slip.base,
            cost_of_living: slip.cost_of_living,
            job_nature: slip.job_nature,
            net_salary: slip.net_salary
          };
        } catch {
          return {
            ...emp,
            base: 0,
            cost_of_living: 0,
            job_nature: 0,
            net_salary: 0
          };
        }
      })
    );
    setEmployees(empsWithNet);
  };

  const fetchDepartments = async () => setDepartments(await getDepartments());
  const fetchBonuses = async () => setBonuses(await getBonuses());
  const fetchDeductions = async () => setDeductions(await getDeductions());

  const handleCreateEmployee = async () => {
    await createEmployee({
      ...newEmployee,
      salary: parseFloat(newEmployee.salary),
      department_id: parseInt(newEmployee.department_id || 0)
    });
    setNewEmployee({
      name: "",
      phone: "",
      department_id: "",
      job_title: "",
      salary: 0,
      payment_method: ""
    });
    fetchEmployees();
    alert("✅ تم إضافة الموظف بنجاح!");
  };

  const handleCreateDepartment = async () => {
    await createDepartment(newDepartment);
    setNewDepartment({ name: "", description: "" });
    fetchDepartments();
  };

  const fetchEmployee = async (id) => {
    if (!id) return;
    try {
      const empList = await getEmployees();
      const emp = empList.find((e) => e.id === parseInt(id));
      if (!emp) return setSelectedEmployee(null);

      const month = selectedMonth || new Date().toISOString().slice(0, 7); // ✅ الشهر المحدد أو الحالي
      const res = await fetch(
        `http://localhost:8000/salary_slips/${emp.id}/${month}`
      );
      const slip = await res.json();

      const empBonuses = (await getBonuses()).filter(
        (b) => b.employee_id === emp.id
      );
      const empDeductions = (await getDeductions()).filter(
        (d) => d.employee_id === emp.id
      );

      const dept = departments.find((d) => d.id === emp.department_id);

      setSelectedEmployee({
        ...emp,
        base: slip.base,
        cost_of_living: slip.cost_of_living,
        job_nature: slip.job_nature,
        net_salary: slip.net_salary,
        department_name: dept ? dept.name : "غير محدد",
        bonuses: empBonuses,
        deductions: empDeductions
      });
    } catch (error) {
      console.error(error);
      setSelectedEmployee(null);
    }
  };

  const getDeptName = (id) => {
    const dept = departments.find((d) => d.id === id);
    return dept ? dept.name : "غير محدد";
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">نظام الموظفين</h1>

      {/* --- التبويبات --- */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "employees" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("employees")}
        >
          الموظفون
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "addEmployee"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("addEmployee")}
        >
          إضافة موظف
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "departments"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("departments")}
        >
          الأقسام
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "bonusesDeductions"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("bonusesDeductions")}
        >
          الحوافز والخصومات
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "fetchEmployee"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("fetchEmployee")}
        >
          جلب موظف
        </button>
      </div>

      {activeTab === "employees" && (
  <section className="p-4 border rounded bg-gray-50 space-y-2">
    <h2 className="text-xl font-semibold">الموظفون</h2>

    {/* ✅ فلتر حسب القسم */}
    <div className="flex items-center gap-2 mb-2">
      <label>تصفية حسب القسم:</label>
      <select
        value={filterDept}
        onChange={(e) => setFilterDept(e.target.value)}
        className="border p-1"
      >
        <option value="">كل الأقسام</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
    </div>

    <table className="w-full border-collapse border">
      <thead>
        <tr className="bg-gray-200">
          <th className="border px-2 py-1">ID</th>
          <th className="border px-2 py-1">الاسم</th>
          <th className="border px-2 py-1">الهاتف</th>
          <th className="border px-2 py-1">الوظيفة</th>
          <th className="border px-2 py-1">الراتب</th>
          <th className="border px-2 py-1">طريقة الدفع</th> {/* ✅ جديد */}
          <th className="border px-2 py-1">صافي الراتب</th> {/* ✅ جديد */}
          <th className="border px-2 py-1">القسم</th>
          <th className="border px-2 py-1">إجراءات</th>
        </tr>
      </thead>
      <tbody>
        {employees
          .filter((emp) => !filterDept || emp.department_id === parseInt(filterDept))
          .map((emp) => (
            <tr key={emp.id}>
              <td className="border px-2 py-1">{emp.id}</td>
              <td className="border px-2 py-1">{emp.name}</td>
              <td className="border px-2 py-1">{emp.phone}</td>
              <td className="border px-2 py-1">{emp.job_title}</td>
              <td className="border px-2 py-1">{emp.salary}</td>
              <td className="border px-2 py-1">{emp.payment_method || "-"}</td> {/* ✅ طريقة الدفع */}
              <td className="border px-2 py-1">{emp.net_salary || 0}</td> {/* ✅ صافي الراتب */}
              <td className="border px-2 py-1">
                {getDeptName(emp.department_id)}
              </td>
              <td className="border px-2 py-1 space-x-1">
                <button
                  className="bg-yellow-500 text-white px-1 py-0.5 rounded"
                  onClick={async () => {
                    const updatedName = prompt("أدخل الاسم الجديد:", emp.name);
                    if (updatedName) {
                      await updateEmployee(emp.id, { ...emp, name: updatedName });
                      fetchEmployees();
                    }
                  }}
                >
                  تعديل
                </button>
                <button
                  className="bg-red-500 text-white px-1 py-0.5 rounded"
                  onClick={async () => {
                    if (confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
                      await deleteEmployee(emp.id);
                      fetchEmployees();
                    }
                  }}
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
      </tbody>

      {/* ✅ إجمالي صافي الرواتب */}
      <tfoot>
        <tr className="bg-gray-100 font-semibold">
          <td colSpan="7" className="text-right border px-2 py-1">
            إجمالي صافي الرواتب:
          </td>
          <td className="border px-2 py-1">
            {employees
              .filter((emp) => !filterDept || emp.department_id === parseInt(filterDept))
              .reduce((sum, emp) => sum + (emp.net_salary || 0), 0)
              .toLocaleString()}
          </td>
          <td className="border px-2 py-1">—</td>
        </tr>
      </tfoot>
    </table>
  </section>
)}

      {/* --- تبويب إضافة موظف --- */}
      {activeTab === "addEmployee" && (
        <section className="p-4 border rounded bg-gray-50 space-y-2">
          <h2 className="text-xl font-semibold">إضافة موظف</h2>
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="الاسم"
              value={newEmployee.name}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, name: e.target.value })
              }
              className="border p-1"
              onKeyDown={(e) =>
                e.key === "Enter" && document.getElementById("phone").focus()
              }
            />
            <input
              id="phone"
              placeholder="الهاتف"
              value={newEmployee.phone}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, phone: e.target.value })
              }
              className="border p-1"
              onKeyDown={(e) =>
                e.key === "Enter" && document.getElementById("department").focus()
              }
            />
            <select
              id="department"
              value={newEmployee.department_id}
              onChange={(e) => {
                const dept = departments.find((d) => d.name === e.target.value);
                setNewEmployee({
                  ...newEmployee,
                  department_id: dept ? dept.id : ""
                });
              }}
              className="border p-1"
              onKeyDown={(e) =>
                e.key === "Enter" && document.getElementById("job_title").focus()
              }
            >
              <option value="">اختر القسم</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              id="job_title"
              placeholder="الوظيفة"
              value={newEmployee.job_title}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, job_title: e.target.value })
              }
              className="border p-1"
              onKeyDown={(e) =>
                e.key === "Enter" && document.getElementById("salary").focus()
              }
            />
            <input
              id="salary"
              placeholder="الأجر"
              type="number"
              value={newEmployee.salary}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, salary: e.target.value })
              }
              className="border p-1"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                document.getElementById("payment_method").focus()
              }
            />
            <input
              id="payment_method"
              placeholder="طريقة الدفع"
              value={newEmployee.payment_method}
              onChange={(e) =>
                setNewEmployee({
                  ...newEmployee,
                  payment_method: e.target.value
                })
              }
              className="border p-1"
              onKeyDown={(e) =>
                e.key === "Enter" && document.getElementById("add_button").focus()
              }
            />
            <button
              id="add_button"
              onClick={handleCreateEmployee}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              إضافة موظف
            </button>
          </div>
        </section>
      )}

      {/* --- تبويب الأقسام --- */}
      {activeTab === "departments" && (
        <section className="p-4 border rounded bg-gray-50 space-y-2">
          <h2 className="text-xl font-semibold">الأقسام</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">الاسم</th>
                <th className="border px-2 py-1">الوصف</th>
                <th className="border px-2 py-1">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td className="border px-2 py-1">{d.id}</td>
                  <td className="border px-2 py-1">{d.name}</td>
                  <td className="border px-2 py-1">{d.description}</td>
                  <td className="border px-2 py-1">
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={async () => {
                        if (confirm("هل أنت متأكد من حذف هذا القسم؟")) {
                          await deleteDepartment(d.id);
                          fetchDepartments();
                        }
                      }}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-x-2 mt-2">
            <input
              type="text"
              placeholder="اسم القسم"
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  name: e.target.value
                })
              }
              className="border p-1"
            />
            <input
              type="text"
              placeholder="الوصف"
              value={newDepartment.description}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  description: e.target.value
                })
              }
              className="border p-1"
            />
            <button
              onClick={handleCreateDepartment}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              إضافة قسم
            </button>
          </div>
        </section>
      )}

      {/* --- تبويب الحوافز والخصومات --- */}
      {activeTab === "bonusesDeductions" && (
        <section className="p-4 border rounded bg-gray-50 space-y-2">
          <h2 className="text-xl font-semibold">الحوافز والخصومات</h2>

          <h3 className="font-semibold mt-2">الحوافز</h3>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">اسم الموظف</th>
                <th className="border px-2 py-1">الشهر</th>
                <th className="border px-2 py-1">المبلغ</th>
                <th className="border px-2 py-1">السبب</th>
                <th className="border px-2 py-1">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {bonuses.map((b) => {
                const emp = employees.find((e) => e.id === b.employee_id);
                return (
                  <tr key={b.id}>
                    <td className="border px-2 py-1">{b.id}</td>
                    <td className="border px-2 py-1">
                      {emp ? emp.name : "-"}
                    </td>
                    <td className="border px-2 py-1">{b.month}</td>
                    <td className="border px-2 py-1">{b.amount}</td>
                    <td className="border px-2 py-1">{b.reason}</td>
                    <td className="border px-2 py-1">
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={async () => {
                          if (confirm("هل أنت متأكد من حذف هذا الحافز؟")) {
                            await deleteBonus(b.id);
                            fetchBonuses();
                          }
                        }}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ✅ فورم إضافة حافز جديد */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">إضافة حافز جديد</h3>
            <div className="flex flex-wrap gap-2">
              <select
                value={newBonus.employee_id || ""}
                onChange={(e) =>
                  setNewBonus({
                    ...newBonus,
                    employee_id: parseInt(e.target.value)
                  })
                }
                className="border p-1"
              >
                <option value="">اختر الموظف</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <input
                type="month"
                value={newBonus.month || ""}
                onChange={(e) =>
                  setNewBonus({ ...newBonus, month: e.target.value })
                }
                className="border p-1"
              />
              <input
                type="number"
                placeholder="المبلغ"
                value={newBonus.amount || ""}
                onChange={(e) =>
                  setNewBonus({ ...newBonus, amount: e.target.value })
                }
                className="border p-1"
              />
              <input
                placeholder="السبب"
                value={newBonus.reason || ""}
                onChange={(e) =>
                  setNewBonus({ ...newBonus, reason: e.target.value })
                }
                className="border p-1"
              />
              
              <button
                onClick={async () => {
                  if (!newBonus.employee_id) return alert("اختر الموظف أولاً");
                  await createBonus({
                    employee_id: newBonus.employee_id,
                    month: newBonus.month,
                    amount: parseFloat(newBonus.amount),
                    reason: newBonus.reason
                  });
                  setNewBonus({});
                  fetchBonuses();
                  alert("✅ تم إضافة الحافز بنجاح");
                }}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                إضافة
              </button>
            </div>
          </div>

          <h3 className="font-semibold mt-4">الخصومات</h3>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">اسم الموظف</th>
                <th className="border px-2 py-1">الشهر</th>
                <th className="border px-2 py-1">المبلغ</th>
                <th className="border px-2 py-1">السبب</th>
                <th className="border px-2 py-1">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map((d) => {
                const emp = employees.find((e) => e.id === d.employee_id);
                return (
                  <tr key={d.id}>
                    <td className="border px-2 py-1">{d.id}</td>
                    <td className="border px-2 py-1">
                      {emp ? emp.name : "-"}
                    </td>
                    <td className="border px-2 py-1">{d.month}</td>
                    <td className="border px-2 py-1">{d.amount}</td>
                    <td className="border px-2 py-1">{d.reason}</td>
                    <td className="border px-2 py-1">
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={async () => {
                          if (confirm("هل أنت متأكد من حذف هذا الخصم؟")) {
                            await deleteDeduction(d.id);
                            fetchDeductions();
                          }
                        }}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ✅ فورم إضافة خصم جديد */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">إضافة خصم جديد</h3>
            <div className="flex flex-wrap gap-2">
              <select
                value={newDeduction.employee_id || ""}
                onChange={(e) =>
                  setNewDeduction({
                    ...newDeduction,
                    employee_id: parseInt(e.target.value)
                  })
                }
                className="border p-1"
              >
                <option value="">اختر الموظف</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <input
                type="month"
                value={newDeduction.month || ""}
                onChange={(e) =>
                  setNewDeduction({ ...newDeduction, month: e.target.value })
                }
                className="border p-1"
              />
              <input
                type="number"
                placeholder="المبلغ"
                value={newDeduction.amount || ""}
                onChange={(e) =>
                  setNewDeduction({ ...newDeduction, amount: e.target.value })
                }
                className="border p-1"
              />
              <input
                placeholder="السبب"
                value={newDeduction.reason || ""}
                onChange={(e) =>
                  setNewDeduction({ ...newDeduction, reason: e.target.value })
                }
                className="border p-1"
              />
              <button
                onClick={async () => {
                  if (!newDeduction.employee_id)
                    return alert("اختر الموظف أولاً");
                  await createDeduction({
                    employee_id: newDeduction.employee_id,
                    month: newDeduction.month,
                    amount: parseFloat(newDeduction.amount),
                    reason: newDeduction.reason
                  });
                  setNewDeduction({});
                  fetchDeductions();
                  alert("✅ تم إضافة الخصم بنجاح");
                }}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                إضافة
              </button>
            </div>
          </div>
        </section>
      )}

      {/* --- تبويب جلب موظف --- */}
      {activeTab === "fetchEmployee" && (
        <section className="p-4 border rounded bg-gray-50 space-y-3">
          <h2 className="text-xl font-semibold">جلب موظف حسب الرقم</h2>
          <div className="flex gap-2 items-center">
         <input
  list="employeeList"
  placeholder="اختر أو ابحث عن الموظف"
  value={employeeIdInput}
  onChange={(e) => setEmployeeIdInput(e.target.value)}
  className="border p-1 flex-1"
/>
<datalist id="employeeList">
  {employees.map((emp) => (
    <option key={emp.id} value={emp.id}>
      {emp.name}
    </option>
  ))}
</datalist>

            
            {/* ✅ اختيار الشهر */}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-1"
            />
            <button
              onClick={() => fetchEmployee(employeeIdInput)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              جلب الموظف
            </button>
          </div>

          {selectedEmployee && (
            <div className="border-t pt-3">
              <h3 className="font-semibold text-lg mb-2">
                بيانات الموظف ({selectedEmployee.name})
              </h3>
              <p>القسم: {selectedEmployee.department_name}</p>
              <p>الوظيفة: {selectedEmployee.job_title}</p>
              <p>الراتب الأساسي: {selectedEmployee.base}</p>
              <p>بدل المعيشة: {selectedEmployee.cost_of_living}</p>
              <p>طبيعة العمل: {selectedEmployee.job_nature}</p>
              <p>صافي الراتب: {selectedEmployee.net_salary}</p>

              <h4 className="mt-3 font-semibold">الحوافز:</h4>
              <ul className="list-disc ms-5">
                {selectedEmployee.bonuses.map((b) => (
                  <li key={b.id}>
                    {b.reason} — {b.amount} ({b.month})
                  </li>
                ))}
              </ul>

              <h4 className="mt-3 font-semibold">الخصومات:</h4>
              <ul className="list-disc ms-5">
                {selectedEmployee.deductions.map((d) => (
                  <li key={d.id}>
                    {d.reason} — {d.amount} ({d.month})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
