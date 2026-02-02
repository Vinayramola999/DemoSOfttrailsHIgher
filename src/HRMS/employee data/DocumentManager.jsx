import { useState } from "react";
import DocUpload from "./EmployeeDocuments";
import RevisionLetterTable from "./RevisionLetterTable";
import SalarySlipTable from "./SalarySlipTable";

function DocumentManager() {
  const [selectedOption, setSelectedOption] = useState("my-docs");

  return (
    <div className="w-full p-2">

      <div className="flex justify-start mb-5">
        <select className="border border-gray-400 rounded-lg px-3 py-2 text-sm" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
          <option value="my-docs">My Documents</option>
          <option value="employee-letter">Employee's Letter</option>
          <option value="salary-slip">Salary Slip</option>
        </select>
      </div>

      {selectedOption === "my-docs" && (<DocUpload />)}
      {selectedOption === "employee-letter" && (<RevisionLetterTable />)}
      {selectedOption === "salary-slip" && (<SalarySlipTable />)}
    </div>
  );
}
export default DocumentManager;