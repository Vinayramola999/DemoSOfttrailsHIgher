import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import excel from '../assests/excel.png';
import swal from 'sweetalert2';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import Swal1 from 'sweetalert2';
import FolderTree from '../assests/foldertree.png';
import { FaPlus } from "react-icons/fa";
import AddButton from "../NewComponents/AddButton";
import SearchButton from "../NewComponents/SearchButton";
import { MAIN_API_BASE } from '../config/apiBase';

const DepartmentsTable = () => {
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const token = sessionStorage.getItem('token');
  const [subDepartments, setSubDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [deleteSubDeptId, setDeleteSubDeptId] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [departmentToContact, setDepartmentToContact] = useState(null);
  const [subDeptName, setSubDeptName] = useState('');
  const [subDeptDesc, setSubDeptDesc] = useState('');
  const [isModalOpen, setIsModalOpen] = useState('');
  const [editSubDept, setEditSubDept] = useState({ sub_dept_name: "", sub_data: "", sub_id: "" });
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isEditModalOpen1, setEditModalOpen1] = useState(false)
  const [editData, setEditData] = useState({ dept_name: "", dept_data: "" });
  const [deleteError, setDeleteError] = useState(null);

  //SUB-DEPARTMENTS
  const handleContact = (department) => {
    setDepartmentToContact(department);
    setIsContactModalOpen(true);
  };

  const handleAddSubdepartment = async () => {
    if (!subDeptName) {
      setError('Verticals is required.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await axios.post(
        `${MAIN_API_BASE}/sub_dept`,
        {
          dept_id: departmentToContact.dept_id,
          sub_dept_name: subDeptName,
          sub_data: subDeptDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset fields
      setSubDeptName('');
      setSubDeptDesc('');

      // SweetAlert2 success alert
      Swal.fire({
        icon: 'success',
        title: 'Subdepartment Added',
        text: 'The subdepartment has been successfully added!',
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error adding subdepartment:', error);
      setError(error.response?.data?.message || 'Failed to add subdepartment.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubDept = async () => {
    try {
      setLoading(true);
      setDeleteError(''); // Clear any previous error
      await axios.delete(`${MAIN_API_BASE}/sub_dept/${deleteSubDeptId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubDepartments((prev) =>
        prev.filter((subDept) => subDept.sub_id !== deleteSubDeptId)
      );
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error('Error deleting vertical:', error);

      // Check if the error response contains the specific message
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes('Key (sub_id)')) {
          setDeleteError('Cannot delete this vertical because it is still referenced by users.');
        } else {
          setDeleteError('Failed to delete vertical. Please try again.');
        }
      } else {
        setDeleteError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const confirmDeleteSubDept = (subDeptId) => {
    setDeleteSubDeptId(subDeptId); // Set the selected vertical ID
    setIsConfirmModalOpen(true); // Open confirmation modal
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setDeleteError('');
  };

  const submitEditSubDept = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = sessionStorage.getItem('token'); // Get token from sessionStorage

    try {
      const response = await fetch(`${MAIN_API_BASE}/sub_dept/${editSubDept.sub_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          sub_dept_name: editSubDept.sub_dept_name,
          sub_data: editSubDept.sub_data,
          status: editSubDept.status,
        }),
      });

      if (response.ok) {
        const fetchResponse = await axios.get(
          `${MAIN_API_BASE}/sub_dept/get/${selectedDepartment}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (fetchResponse.status === 200) {
          setSubDepartments(fetchResponse.data);
        }

        setEditModalOpen1(false);

        Swal.fire({
          icon: 'success',
          title: 'Subdepartment Updated',
          text: 'The subdepartment has been successfully updated!',
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        console.error("Failed to update sub-department");
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Unable to update the subdepartment. Please try again later.',
        });
      }
    } catch (error) {
      console.error("Error updating sub-department:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating the subdepartment.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubDept = (subDept) => {
    setEditSubDept(subDept);
    setEditModalOpen1(true);
  };

  //DEPARTMENTS
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${MAIN_API_BASE}/departments`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const sortedDepartments = response.data.sort((a, b) => {
          if (a.dept_name.toLowerCase() < b.dept_name.toLowerCase()) return -1;
          if (a.dept_name.toLowerCase() > b.dept_name.toLowerCase()) return 1;
          return 0;
        });
        setDepartments(sortedDepartments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, [token]);

  const handleAddDepartment = async () => {
    if (!newDeptName) {
      setError('Department name is required');
      return;
    }
    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${MAIN_API_BASE}/departments`,
        {
          dept_name: newDeptName,
          dept_data: newDeptDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update state with the new department
      setDepartments([...departments, response.data.department]);
      setNewDeptName('');
      setNewDeptDesc('');
      setIsAddModalOpen(false);

      // Show success alert with SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'Department Added',
        text: 'The department has been added successfully!',
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('already exists')) {
          setError('Department already exists');
        } else {
          setError(error.response.data.message);
        }
      } else {
        console.error('Error adding department:', error);
        setError('Failed to add department. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${MAIN_API_BASE}/departments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDepartments(departments.filter((department) => department.dept_id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting department:', error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message.includes('is still referenced from table "users"')
      ) {
        swal(
          'Error',
          'Cannot delete this department because it is being used in the user directory.',
          'error'
        );
      } else {
        swal('Error', 'Failed to delete department. Please try again.', 'error');
      }
    }
  };

  const confirmDelete = (department) => {
    setDepartmentToDelete(department);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = (department) => {
    setEditData(department); // Pre-fill form with current department data
    setEditModalOpen(true);  // Open the modal
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token'); // Get token from sessionStorage

    try {
      const response = await fetch(`${MAIN_API_BASE}/departments/${editData.dept_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          dept_name: editData.dept_name,
          dept_data: editData.dept_data,
          status: editData.status,
        }),
      });

      if (response.ok) {
        const updatedDepartment = await response.json();
        console.log("Updated department:", updatedDepartment);

        try {
          const res = await axios.get(`${MAIN_API_BASE}/departments`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          setDepartments(res.data);
          setEditModalOpen(false);

          Swal1.fire({
            icon: 'success',
            title: 'Department Updated',
            text: 'The department has been successfully updated!',
            timer: 3000,
            timerProgressBar: true,
          });
        } catch (fetchError) {
          console.error("Error fetching updated departments:", fetchError);
        }
      } else {
        console.error("Failed to update department");
      }
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(departments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'Department.xlsx');
  };

  // const handleDownloadExcel = () => {
  //   const formattedData = departments.map((dept) => ({
  //     "Department Name": dept.name,
  //     "Department Description": dept.description,
  //     "Department Status": dept.status,
  //     "Sub-Departments": dept.subDepartments
  //       ?.map(
  //         (sub) =>
  //           `${sub.name} (${sub.description}, ${sub.status})`
  //       )
  //       .join(" | ") || "—",
  //   }));

  //   const worksheet = XLSX.utils.json_to_sheet(formattedData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Departments");

  //   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  //   const data = new Blob([excelBuffer], { type: "application/octet-stream" });

  //   saveAs(data, "Departments.xlsx");
  // };

  const handleDepartmentClick = async (dept_id) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token"); // Get token from sessionStorage

      const response = await axios.get(`${MAIN_API_BASE}/sub_dept/get/${dept_id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to headers
        },
      });

      if (response.status === 200) {
        setSubDepartments(response.data);
        setSelectedDepartment(dept_id);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching subdepartments:", error);
    } finally {
      setLoading(false);
    }
  };

  /************** Pagination and Search Bar ***********/
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter departments based on search term
  const filteredDepartments = departments.filter((department) =>
    department.dept_name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Calculate pagination data
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const currentItems = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  /*****************END**************/

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Add Department</AddButton>
        <div className="flex-grow"><SearchButton value={searchTerm} onChange={handleSearchChange} /></div>
        {/* Excel Download Button */}
        <button
          onClick={handleDownloadExcel}
          className="text-green-500 flex-shrink-0 sm:w-auto w-full text-center"
        >
          <img src={excel} alt="logo" className="w-8 h-8 mx-auto" />
        </button>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            {error && <p className="text-red-500">{error}</p>}
            <h2 className="text-xl font-bold mb-4">Create Department</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddDepartment(); }}>
              <div className="mb-4">
                <label htmlFor="dept_name">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="dept_name"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter Department Name"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="dept_data">Department Description</label>
                <textarea
                  id="dept_data"
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter Department Description"
                />
              </div>
              <div className="flex">
                <button
                  type="submit"
                  className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${loading ? 'opacity-50' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Department'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewDeptName('');
                    setNewDeptDesc('');
                    setError('');
                    setIsAddModalOpen(false);
                  }}
                  className="bg-red-500  hover:bg-red-600 text-white px-4 py-2 rounded-lg ml-5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-xl mb-4">Edit Department</h2>
            <form onSubmit={submitEdit}>
              {/* Department Name */}
              <div className="mb-4">
                <label className="block text-black">
                  Department Name<span className='text-red-500'>*</span>
                </label>
                <input
                  type="text"
                  value={editData.dept_name}
                  onChange={(e) => setEditData({ ...editData, dept_name: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              {/* Department Data */}
              <div className="mb-4">
                <label className="block text-gray-700">Department Data</label>
                <textarea
                  value={editData.dept_data}
                  onChange={(e) => setEditData({ ...editData, dept_data: e.target.value })}
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>

              {/* Status Radio Buttons */}
              <div className="mb-4">
                <label className="block text-gray-700">Status</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={editData.status === "Active"}
                      onChange={() => setEditData({ ...editData, status: "Active" })}
                      className="form-radio text-blue-500"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={editData.status === "Inactive"}
                      onChange={() => setEditData({ ...editData, status: "Inactive" })}
                      className="form-radio text-red-500"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 sm:w-2/3 lg:w-1/3">
            {deleteError && (
              <p className="mt-4 text-red-500"> This department cannot be deleted because it is still in use by other records.</p>
            )}
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p>
              Are you sure you want to delete the department:{" "}
              <strong>{departmentToDelete?.dept_name}</strong>?
            </p>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteError(null); // Clear any previous error
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await handleDelete(departmentToDelete.dept_id);
                    setDeleteError(null);
                  } catch (err) {
                    if (
                      err.response &&
                      err.response.data &&
                      err.response.data.message ===
                      'Key (dept_id)=(3) is still referenced from table "users".'
                    ) {
                      setDeleteError(
                        "This department cannot be deleted because it is still in use by other records."
                      );
                    } else {
                      setDeleteError("Failed to delete department. Please try again.");
                    }
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isContactModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            {error && <p className="text-red-500">{error}</p>}
            <h2 className="text-xl font-bold mb-4">Create Verticals</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddSubdepartment(); }}>
              <div className="mb-4">
                <label htmlFor="sub_dept_name">Verticals <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="sub_dept_name"
                  value={subDeptName}
                  onChange={(e) => setSubDeptName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter Verticals"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="sub_data">Description</label>
                <textarea
                  id="sub_data"
                  value={subDeptDesc}
                  onChange={(e) => setSubDeptDesc(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter Description"
                />
              </div>
              <div className="flex">
                <button
                  type="submit"
                  className={`bg-blue-500  hover:bg-blue-700 text-white px-4 py-2 rounded-lg ${loading ? 'opacity-50' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Verticals'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubDeptName('');
                    setSubDeptDesc('');
                    setError('');
                    setIsContactModalOpen(false);
                  }
                  }
                  className="bg-red-500  hover:bg-red-700 text-white px-4 py-2 rounded-lg ml-5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl relative shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              ✖
            </button>
            <h2 className="text-[18px] text-custome-blue font-bold my-1 mb-3">
              Verticals {selectedDepartment.dept_name}
            </h2>
            <div className="overflow-x-auto rounded-lg shadow-inner border border-gray-300 overflow-y-auto max-h-[calc(5*48px)]">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4 border-b text-left">S.no.</th>
                    <th className="py-3 px-4 border-b text-left">Verticals</th>
                    <th className="py-3 px-4 border-b text-left">Description</th>
                    <th className="py-3 px-4 border-b text-left">Status</th>
                    <th className="py-3 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subDepartments.length === 0 ? (
                    <tr>
                      <td colSpan="4"
                        className="p-3 text-center text-gray-500 bg-white border-b"
                      >
                        No Verticals
                      </td>
                    </tr>
                  ) : (
                    subDepartments.map((subDept, index) => (
                      <tr key={subDept.id} className={`border-t ${index % 2 === 0 ? "bg-blue-50" : "bg-white"}`}>
                        <td className="p-3 border-b text-left">{index + 1}</td>
                        <td className="p-3 border-b text-left">{subDept.sub_dept_name}</td>
                        <td className="p-3 border-b text-left">{subDept.sub_data || 'NA'}</td>
                        <td className={`p-3 border-b text-left font-semibold ${subDept.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                          {subDept.status}
                        </td>
                        <td className="p-3 text-left">
                          <button
                            onClick={() => confirmDeleteSubDept(subDept.sub_id)}
                            className="text-red-500 px-2 py-2 rounded-lg"
                            disabled={loading}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                          <button
                            onClick={() => handleEditSubDept(subDept)}
                            className="text-blue-500 px-2 py-2 rounded-lg"
                            disabled={loading}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isConfirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            {deleteError && (
              <div className="text-red-500 mt-2">
                <p>{deleteError}</p>
              </div>
            )}
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this vertical?</p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubDept}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen1 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-[30%] max-w-2xl relative">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setEditModalOpen1(false)}
            >
              ✖
            </button>

            {/* Modal Heading */}
            <h2 className="text-xl font-semibold mb-4">Edit Verticals</h2>

            <form onSubmit={submitEditSubDept} className="space-y-4">
              {/* Vertical Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vertical Name
                </label>
                <input
                  type="text"
                  value={editSubDept.sub_dept_name}
                  onChange={(e) =>
                    setEditSubDept({ ...editSubDept, sub_dept_name: e.target.value })
                  }
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vertical Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vertical Description
                </label>
                <input
                  type="text"
                  value={editSubDept.sub_data}
                  onChange={(e) =>
                    setEditSubDept({ ...editSubDept, sub_data: e.target.value })
                  }
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Radio Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex items-center space-x-4 mt-1">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={editSubDept.status === "Active"}
                      onChange={() => setEditSubDept({ ...editSubDept, status: "Active" })}
                      className="form-radio text-blue-500"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={editSubDept.status === "Inactive"}
                      onChange={() => setEditSubDept({ ...editSubDept, status: "Inactive" })}
                      className="form-radio text-red-500"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-start space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  onClick={() => setEditModalOpen1(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/************** Department Table ***************/}
      <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="text-[14px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
              <tr>
                <th className="p-5 text-left text-black">S.No</th>
                <th className="p-5 text-left text-black">Department</th>
                <th className="p-5 text-left text-black">Description</th>
                <th className="p-5 text-left text-black">Status</th>
                <th className="p-5 text-left text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
              {currentItems.map((department, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-tableblue' : 'bg-white'}`}>
                  <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-5 py-4 text-left text-[14px] text-custome-blue underline cursor-pointer" onClick={() => handleDepartmentClick(department.dept_id)}>{department.dept_name}</td>
                  <td className="px-5 py-4 text-left text-[14px] text-black">{department.dept_data || "NA"}</td>
                  <td className={`py-4 px-5 text-[14px] font-semibold ${department.status === "Active" ? "text-green-600" : "text-red-600"}`}>{department.status}</td>
                  <td className="py-4 px-4 space-x-2">
                    <button className="text-red-500 hover:text-red-700" onClick={() => confirmDelete(department)}><FontAwesomeIcon icon={faTrash} /></button>
                    <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEdit(department)}><FontAwesomeIcon icon={faEdit} /></button>
                    <button className="text-blue-500 hover:text-blue-700" onClick={() => handleContact(department)}><img src={FolderTree} alt="Sub Icon" className="w-5 h-5 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Sticky Pagination */}
      {totalPages > 1 && (
        <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt;
          </button>
          <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
          <span>of</span>
          <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">
            {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &gt;
          </button>
        </div>
      )}
    </div >
  );
};
export default DepartmentsTable;