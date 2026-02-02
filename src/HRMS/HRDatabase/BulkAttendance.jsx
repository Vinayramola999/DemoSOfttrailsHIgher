// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { CalendarIcon, FileSpreadsheet, FileText } from "lucide-react";

// export default function AttendancePage() {
//   return (
//     <div className="w-full min-h-screen bg-[#f8faf7] p-6">
//       {/* Top Bar */}
//       <div className="flex items-center justify-between mb-6">
// <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl">
//   + Bulk upload
// </Button>

//         <div className="flex items-center space-x-4">
//           <FileSpreadsheet className="w-6 h-6 cursor-pointer" />
//           <FileText className="w-6 h-6 cursor-pointer text-red-600" />
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="flex items-center space-x-4 mb-4">
//         <Input
//           placeholder="Search"
//           className="w-64 bg-white rounded-xl border px-4 py-2"
//         />

//         <select className="border rounded-xl px-4 py-2 bg-white">
//           <option>Status</option>
//           <option>Present</option>
//           <option>Absent</option>
//         </select>

//         <div className="flex items-center space-x-2">
//           <Input
//             placeholder="dd/mm/yyyy"
//             className="w-40 bg-white rounded-xl px-4 py-2"
//           />
//           <span className="text-gray-500">TO</span>
//           <Input
//             placeholder="dd/mm/yyyy"
//             className="w-40 bg-white rounded-xl px-4 py-2"
//           />
//           <CalendarIcon className="w-5 h-5 text-gray-600" />
//         </div>
//       </div>

//       {/* Table */}
//       <Card className="shadow-none border rounded-2xl overflow-hidden">
//         <CardContent className="p-0">
//           <table className="w-full text-sm">
//             <thead className="bg-white text-gray-600 border-b">
//               <tr>
//                 <th className="p-4 text-left">S. No.</th>
//                 <th className="p-4 text-left">Employee Name</th>
//                 <th className="p-4 text-left">Employee Code</th>
//                 <th className="p-4 text-left">Date</th>
//                 <th className="p-4 text-left">IN</th>
//                 <th className="p-4 text-left">Out</th>
//                 <th className="p-4 text-left">Status</th>
//               </tr>
//             </thead>

//             <tbody>
//               <tr className="bg-blue-50 border-b">
//                 <td className="p-4">1.</td>
//                 <td className="p-4 text-blue-700 cursor-pointer underline">Poonam Rupini</td>
//                 <td className="p-4">120033</td>
//                 <td className="p-4">26 November 2025</td>
//                 <td className="p-4">9:30 AM</td>
//                 <td className="p-4">6:30 PM</td>
//                 <td className="p-4 text-green-600 font-medium">Present</td>
//               </tr>
//             </tbody>
//           </table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import { DeleteIcon } from "../../NewComponents/ReactIcons";
import Pagination from "../../NewComponents/Pagination";
import Select from "react-select";
import Swal from "sweetalert2";
import axios from "axios";

const RevisionLetter = () => {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const policiesPerPage = 25;
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [documentUrl, setDocumentUrl] = useState(null);
    const [HRDocuments, setHRDocuments] = useState([]);
    const [formData, setFormData] = useState({
        categoryId: "",
        employeeId: "",
        employeeName: "",
        date: "",
        status: true,
    });
    const [employees, setEmployees] = useState([]);
    const token = sessionStorage.getItem("token");

    /* ---------------- Submit Form ---------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const Token = sessionStorage.getItem("token");

        const payload = {
            user_id: formData.employeeId,
            category_id: formData.categoryId,
            doc_date: formData.date,
            source: "HR Department",
            doc_url: documentUrl
        };

        try {
            const response = await fetch(
                "https://devdemo.softtrails.net/documents/employee-documents",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${Token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Uploaded!",
                    text: "Employee document stored successfully.",
                });

                setShowForm(false);
                setDocumentUrl("");
                setFormData({
                    categoryId: "",
                    employeeId: "",
                    employeeName: "",
                    date: "",
                });

                fetchHRDocuments();

            } else {
                Swal.fire("Failed", result.message || "Something went wrong.", "error");
            }

        } catch (error) {
            Swal.fire("Error", "Something went wrong while saving the document.", "error");
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setDocumentUrl("");
        setFormData({ categoryId: "", employeeName: "", date: "" });
    };

    /* ---------------- Search & Pagination ---------------- */
    const filteredDocs = HRDocuments.filter((doc) =>
        doc.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLast = currentPage * policiesPerPage;
    const indexOfFirst = indexOfLast - policiesPerPage;
    const currentHRDocs = filteredDocs.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredDocs.length / policiesPerPage);

    /* ---------------- Fetch Categories && HR Documents && EMployee List ---------------- */
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const Token = sessionStorage.getItem('token');
                const response = await axios.get(
                    "https://devdemo.softtrails.net/users/getusers",
                    { headers: { Authorization: `Bearer ${Token}` } }
                );
                setEmployees(response.data.users);
            } catch (err) {
                console.error("Failed to fetch employees", err);
            }
        };
        fetchEmployees();
    }, []);

    const fetchHRDocuments = async () => {
        try {
            const response = await fetch(
                "https://devdemo.softtrails.net/documents/employee-documents",
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            const result = await response.json();
            if (Array.isArray(result)) {
                const hrDocs = result.filter(
                    (doc) => doc.source === "HR Department"
                );
                setHRDocuments(hrDocs);
            } else if (result.data) {
                const hrDocs = result.data.filter(
                    (doc) => doc.source === "HR Department"
                );
                setHRDocuments(hrDocs);
            }

        } catch (error) {
            console.error("Error fetching HR department docs:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchHRDocuments();
    }, []);

    const fetchCategories = async () => {
        const Token = sessionStorage.getItem("token");

        try {
            const res = await fetch("https://devdemo.softtrails.net/documents/categories", {
                headers: {
                    "Accept": "application/json",
                    Authorization: `Bearer ${Token}`,
                },
            });

            const data = await res.json();
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                setCategories([]);
            }

        } catch (error) {
            console.error("Failed to fetch categories:", error);
            setCategories([]);
        }
    };

    /* ---------------- Add New Category ---------------- */
    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;

        const Token = sessionStorage.getItem("token");

        try {
            const response = await fetch(
                "https://devdemo.softtrails.net/documents/categories",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${Token}`,
                    },
                    body: JSON.stringify({
                        category_name: newCategory.trim(),
                    }),
                }
            );
            if (response.ok) {
                Swal.fire("Success", "Category added!", "success");
                fetchCategories();
                setNewCategory("");
                setShowNewCategoryInput(false);
            } else {
                const result = await response.json();
                Swal.fire("Failed", result.message || "Something went wrong", "error");
            }

        } catch (error) {
            Swal.fire("Error", "Failed to add category", "error");
        }
    };

    /* ---------------- Delete Policy ---------------- */
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);


    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setDeleteId(null);
        setDeleteError("");
    };

    const confirmDelete = async () => {
        setDeleteLoading(true);
        setDeleteError("");
        try {
            const response = await fetch(
                `https://devdemo.softtrails.net/documents/employee-documents/${deleteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setDeleteError(result.message || "Delete failed");
            } else {
                setHRDocuments((prev) =>
                    prev.filter((item) => item.id !== deleteId)
                );
                setDeleteModalOpen(false);
            }
        } catch (error) {
            setDeleteError("Something went wrong while deleting.");
        }
        setDeleteLoading(false);
    };

    /* ---------------- DMS Upload ---------------- */
    const getDmsPublishId = async () => {
        try {
            const response = await axios.get(
                "https://devdemo.softtrails.net/mapping/check",
                {
                    params: {
                        service_name: "HRMS",
                        doctype: "Revision Letter",
                        doc_name: "Revision Letter",
                    },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data.dms_publish_id || null;
        } catch {
            return null;
        }
    };

    const handleFileUpload = async (file) => {
        const publishId = await getDmsPublishId();
        const userId = sessionStorage.getItem("userId");

        const uploadData = new FormData();
        uploadData.append("documents", file);
        uploadData.append("ref", "DMS");

        uploadData.append(
            "metadata",
            JSON.stringify([
                {
                    service: "HRMS",
                    publish_id: parseInt(publishId),
                    user_id: userId,
                    document_name: file.name,
                },
            ])
        );
        const response = await fetch(
            "https://devdemo.softtrails.net/dmsapi/upload-documents",
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: uploadData,
            }
        );
        const data = await response.json();
        return data.uploaded_files?.[0]?.file_url || null;
    };

    /****************** CATEGORY  DELETE  ***************** */
    const CategoryOptionComponent = (props) => {
        const { data } = props;

        return (
            <div
                {...props.innerProps}
                className="flex justify-between items-center px-2 py-1 cursor-pointer hover:bg-gray-100"
            >
                <span>{data.label}</span>

                {/* Delete Icon ONLY for existing categories */}
                {!data.isAddNew && (
                    <span
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(data.value);
                        }}
                    >
                        <DeleteIcon />
                    </span>
                )}
            </div>
        );
    };

    const categoryOptions = categories.map(cat => ({
        value: cat.id,
        label: cat.category_name,
    }));

    categoryOptions.push({
        value: "__add_new__",
        label: "+ Add New Category",
        isAddNew: true,
    });

    const handleDeleteCategory = async (id) => {
        const Token = sessionStorage.getItem("token");
        const confirm = await Swal.fire({
            title: "Delete Category?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`https://devdemo.softtrails.net/documents/categories/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${Token}`
                }
            });

            if (res.ok) {
                Swal.fire("Deleted!", "Category removed", "success");
                fetchCategories();
            } else {
                Swal.fire("Failed", "Cannot delete category", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Something went wrong", "error");
        }
    };

    return (
        <div>
            <div className="flex items-center mb-4 mt-2">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl">+ Bulk upload</button>
                <input type="text" placeholder="Search" className="border rounded-lg px-4 py-2 w-1/5 ml-5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {/* ---------------- TABLE ---------------- */}
            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0 z-10" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Employee Code</th>
                                <th className="p-5 text-left text-black">Employee Name</th>
                                <th className="p-5 text-left text-black">Date</th>
                                <th className="p-5 text-left text-black">IN</th>
                                <th className="p-5 text-left text-black">OUt</th>
                                <th className="p-5 text-left text-black">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {filteredDocs.length === 0 && (<tr> <td colSpan="7" className="text-center p-4 text-gray-500"> No HR Documents Found </td> </tr>)}
                            {currentHRDocs.map((doc, index) => (
                                <tr key={doc.id} className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}`} >
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> {indexOfFirst + index + 1} </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">11001</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> Vinay  </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">27/11/25</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">9:30</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">18:30</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-green"> Present </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        if (page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                        }
                    }}
                />
            </div>

            {/* ---------------- ADD FORM ---------------- */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded w-[600px] max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Add Employee's Policy</h2>
                            <button onClick={handleCancel} className="text-black-600 text-lg font-bold"> × </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Category Dropdown */}
                                <div>
                                    <label className="text-sm font-medium">Letter Category <span className="text-red-500">*</span></label>
                                    <Select
                                        options={categoryOptions}
                                        components={{ Option: CategoryOptionComponent }}
                                        placeholder="Select Category"
                                        value={formData.categoryId ? categoryOptions.find(opt => opt.value === formData.categoryId) : null}
                                        onChange={(selected) => {
                                            if (selected.value === "__add_new__") {
                                                setShowNewCategoryInput(true);
                                                return;
                                            }
                                            setShowNewCategoryInput(false);
                                            setFormData(prev => ({ ...prev, categoryId: selected.value }));
                                        }}
                                        className="w-full"
                                        classNamePrefix="select"
                                    />
                                    {showNewCategoryInput && (
                                        <div className="flex gap-2 mt-2">
                                            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category" className="border rounded px-2 py-1 flex-1" />
                                            <button type="button" onClick={handleAddCategory} className="bg-green-600 text-white px-3 rounded" > Add </button>
                                        </div>
                                    )}
                                </div>
                                {/* Employee Name */}
                                <div>
                                    <label className="text-sm font-medium">Employee Name<span className="text-red-500">*</span></label>
                                    <Select
                                        options={employees.map(emp => ({ value: emp.user_id, label: `${emp.first_name} ${emp.last_name} (${emp.emp_id})`, empId: emp.emp_id, fullName: `${emp.first_name} ${emp.last_name}` }))}
                                        onChange={(selected) => { setFormData(prev => ({ ...prev, employeeId: selected.value, employeeName: selected.fullName })); }}
                                        placeholder="Select or Search Employee"
                                        isSearchable={true}
                                        className="w-full"
                                    />
                                </div>
                                {/* Date */}
                                <div>
                                    <label className="text-sm font-medium">Date<span className="text-red-500">*</span></label>
                                    <input type="date" value={formData.date} onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value, }))} className="w-full border rounded px-3 py-2" />
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.png"
                                    className="w-full px-3 py-2 mt-5"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const uploadedUrl = await handleFileUpload(file);
                                        if (uploadedUrl) {
                                            setDocumentUrl(uploadedUrl);
                                            Swal.fire("Uploaded!", "File uploaded successfully!", "success");
                                        } else { Swal.fire("Failed", "Upload failed!", "error"); }
                                    }}
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-4">
                                <button type="button" onClick={handleCancel} className="border px-4 py-2 rounded" > Cancel </button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" > Submit </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmModal
                open={deleteModalOpen}
                title="Delete Document?"
                message="Are you sure you want to delete this document?"
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
                loading={deleteLoading}
                errorMessage={deleteError}
            />
        </div>
    );
};
export default RevisionLetter;
