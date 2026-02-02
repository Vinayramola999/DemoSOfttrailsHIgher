import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import excel from '../assests/excel.png';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import AddButton from "../NewComponents/AddButton";
import { FaPlus } from "react-icons/fa";
import SearchButton from "../NewComponents/SearchButton";
import { MAIN_API_BASE } from '../config/apiBase';

const DesignationTable = () => {
    const navigate = useNavigate();
    const [designations, setDesignations] = useState([]);
    const [newDesignationName, setNewDesignationName] = useState('');
    const [newDesignationDescription, setNewDesignationDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [designationToDelete, setDesignationToDelete] = useState(null);
    const [formError, setFormError] = useState('');
    const token = sessionStorage.getItem('token');
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        fetchDesignations();
    }, []);

    const fetchDesignations = async () => {
        try {
            const response = await axios.get(`${MAIN_API_BASE}/designation`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const sortedDesignations = response.data.sort((a, b) => {
                if (a.designation.toLowerCase() < b.designation.toLowerCase()) return -1;
                if (a.designation.toLowerCase() > b.designation.toLowerCase()) return 1;
                return 0;
            });

            setDesignations(sortedDesignations);
            setDesignations(response.data);
        } catch (error) {
            console.error('Error fetching designations:', error);
        }
    };

    const handleAddDesignation = async () => {
        if (!newDesignationName || !newDesignationDescription) {
            setFormError('Both name and description are required.');
            return;
        }
        try {
            setLoading(true);
            setFormError(''); // Clear any existing error

            const response = await axios.post(`${MAIN_API_BASE}/designation`, {
                designation: newDesignationName,
                description: newDesignationDescription,
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            // Update state with the new designation
            setDesignations([...designations, response.data.designation]);
            setNewDesignationName('');
            setNewDesignationDescription('');
            setIsAddModalOpen(false);

            // Show success alert with SweetAlert2
            Swal.fire({
                icon: 'success',
                title: 'Designation Added',
                text: 'The designation has been added successfully!',
                timer: 3000,
                timerProgressBar: true,
            });
        } catch (error) {
            console.error('Error adding designation:', error);
            if (error.response?.data?.message) {
                setFormError(error.response.data.message);
            } else {
                setFormError('Failed to add designation.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${MAIN_API_BASE}/designation/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setDesignations(designations.filter(designation => designation.desig_id !== id));
            setIsDeleteModalOpen(false);
            setDeleteError('');
        } catch (error) {
            console.error('Error deleting designation:', error);
            if (error.response && error.response.data.message) {
                setDeleteError(error.response.data.message);
            } else {
                setDeleteError('Failed to delete designation.');
            }
        }
    };

    const confirmDelete = (designation) => {
        setDesignationToDelete(designation);
        setIsDeleteModalOpen(true);
    };

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(designations);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Designations');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'Designations.xlsx');
    };


    useEffect(() => {
        const handlePopState = () => {
            navigate('/Cards1');
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [navigate]);

    /*****************SEARCH TERM *******************/
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredDesignations = designations.filter((designation) => {
        return (
            designation.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            designation.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    /********************** PAgiantion *************** */
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15; // Adjust as needed
    const totalPages = Math.ceil(filteredDesignations.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Slice the filteredDesignations array for pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentDesignations = filteredDesignations.slice(startIndex, startIndex + itemsPerPage);
    /**********************END*******************/

    /******************EDIT API **********************/
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editDesignationName, setEditDesignationName] = useState('');
    const [editDesignationDescription, setEditDesignationDescription] = useState('');
    const [editDesignationStatus, setEditDesignationStatus] = useState('');
    const [selectedDesignationId, setSelectedDesignationId] = useState(null);

    const handleEditClick = (designation) => {
        setIsEditModalOpen(true);
        setEditDesignationName(designation.designation); // Prefill Designation Name
        setEditDesignationDescription(designation.description); // Prefill Description
        setEditDesignationStatus(designation.status); // Prefill Description
        setSelectedDesignationId(designation.desig_id); // Store ID for Editing ✅ FIXED
    };

    const handleEditDesignation = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem("token"); // Get token from storage

            const response = await fetch(`${MAIN_API_BASE}/designation/${selectedDesignationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`, // ✅ Add Authorization token
                },
                body: JSON.stringify({
                    designation: editDesignationName,
                    description: editDesignationDescription,
                    status: editDesignationStatus,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.message.includes("already exists")) {
                    throw new Error(`Designation "${editDesignationName}" already exists.`);
                } else {
                    throw new Error('Failed to update designation.');
                }
            }

            // Success Alert
            Swal.fire({
                icon: 'success',
                title: 'Updated Successfully!',
                text: `Designation "${editDesignationName}" has been updated.`,
                timer: 2000,
                showConfirmButton: false,
            });

            setIsEditModalOpen(false);
            await fetchDesignations(); // Refresh list
        } catch (error) {
            // Handle "already exists" error
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Designation',
                text: error.message || 'Designation name already exists. Please use a different name.',
            });

            setFormError(error.message);
        } finally {
            setLoading(false);
        }
    };
    /********************* END *******************/
    return (
        <div className=" w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Add Designation</AddButton>
                <div className="flex-grow"><SearchButton value={searchTerm} onChange={handleSearch} /></div>
                <button onClick={handleDownloadExcel} className="text-green-500 flex-shrink-0 w-full sm:w-[10%] text-center" > <img src={excel} alt="logo" className="w-8 h-8 mx-auto" /> </button>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Create Designation</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddDesignation();
                            }}>
                            <div className="mb-4">
                                <label htmlFor="designation_name">Designation Name <span className='text-red-500'>*</span></label>
                                <input
                                    type="text"
                                    id="designation_name"
                                    value={newDesignationName}
                                    onChange={(e) => setNewDesignationName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Enter Designation Name"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="designation_description">Description <span className='text-red-500'>*</span></label>
                                <input
                                    type="text"
                                    id="designation_description"
                                    value={newDesignationDescription}
                                    onChange={(e) => setNewDesignationDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Enter Designation Description"
                                    required
                                />
                            </div>
                            <div className="flex">
                                <button
                                    type="submit"
                                    className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${loading ? 'opacity-50' : ''}`}
                                    disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Designation'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false); // Close the modal
                                        setNewDesignationName(''); // Reset designation name
                                        setNewDesignationDescription(''); // Reset description
                                        setFormError(''); // Clear the error message
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg ml-5"
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
                    <div className="bg-white p-6 rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                        {/* Display error if exists */}
                        {deleteError && (
                            <div className="text-red-500 mt-4">
                                <p>{deleteError}</p>
                            </div>
                        )}
                        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                        <p>
                            Are you sure you want to delete the designation: <strong>{designationToDelete?.designation}</strong>?
                        </p>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteError(''); // Clear error when modal is closed
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(designationToDelete.desig_id)}
                                className="bg-red-500 text-white px-4 py-2 rounded">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Edit Designation</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleEditDesignation();
                            }}
                        >
                            {/* Designation Name */}
                            <div className="mb-4">
                                <label htmlFor="edit_designation_name">
                                    Designation Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="edit_designation_name"
                                    value={editDesignationName}
                                    onChange={(e) => setEditDesignationName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Enter Designation Name"
                                    required
                                />
                            </div>

                            {/* Designation Description */}
                            <div className="mb-4">
                                <label htmlFor="edit_designation_description">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="edit_designation_description"
                                    value={editDesignationDescription}
                                    onChange={(e) => setEditDesignationDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Enter Designation Description"
                                    required
                                />
                            </div>

                            {/* Status Radio Buttons */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <div className="flex items-center space-x-4 mt-1">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="Active"
                                            checked={editDesignationStatus === "Active"}
                                            onChange={() => setEditDesignationStatus("Active")}
                                            className="form-radio text-blue-500"
                                        />
                                        <span>Active</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="Inactive"
                                            checked={editDesignationStatus === "Inactive"}
                                            onChange={() => setEditDesignationStatus("Inactive")}
                                            className="form-radio text-red-500"
                                        />
                                        <span>Inactive</span>
                                    </label>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex">
                                <button
                                    type="submit"
                                    className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${loading ? "opacity-50" : ""}`}
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Update Designation"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false); // Close modal
                                        setEditDesignationName(""); // Reset input
                                        setEditDesignationDescription("");
                                        setEditDesignationStatus("Active"); // Reset status to Active
                                        setFormError("");
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg ml-5"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/*****  Designation Table *******/}
            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Designation</th>
                                <th className="p-5 text-left text-black">Description</th>
                                <th className="p-5 text-left text-black">Status</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
                            {currentDesignations.map((designation, index) => (
                                <tr key={index} className={`${index % 2 === 0 ? 'bg-tableblue' : 'bg-white'}`}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{designation.designation}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{designation.description}</td>
                                    <td className={`py-4 px-5 text-[14px] font-semibold ${designation.status === "Active" ? "text-green-600" : "text-red-600"}`}>{designation.status}</td>
                                    <td className="py-4 px-4 space-x-2">
                                        <button onClick={() => handleEditClick(designation)} className="text-blue-500 hover:text-blue-700"><FontAwesomeIcon icon={faEdit} /></button>
                                        <button onClick={() => confirmDelete(designation)} className="text-red-500 hover:text-red-700 ml-4"><FontAwesomeIcon icon={faTrash} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
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
                </div>)}
        </div>
    );
};
export default DesignationTable;