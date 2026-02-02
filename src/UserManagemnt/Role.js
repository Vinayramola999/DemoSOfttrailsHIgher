import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import excel from '../assests/excel.png';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { FiLogOut } from "react-icons/fi";
import AddButton from "../NewComponents/AddButton";
import { FaPlus } from "react-icons/fa";
import { MAIN_API_BASE } from '../config/apiBase';

const RoleTable = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [newRoleName, setNewRoleName] = useState('');
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    const [newRoleDescription, setNewRoleDescription] = useState(''); 
    const [newRoleAccess, setNewRoleAccess] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => { 
        const userId = sessionStorage.getItem("userId");
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(
                        `${MAIN_API_BASE}/users/id_user/${userId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    if (response.data.user) {
                        const user = response.data.user;
                        setUserData(user);
                    } else {
                        console.log("No user data found");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            };

            fetchUserData();
        }
    }, [token, userId]);


    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        const token = sessionStorage.getItem('token'); // Retrieve the token
        try {
            const response = await axios.get(`${MAIN_API_BASE}/role`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add token to headers
                }
            });
            // Sort roles alphabetically by the 'role' key
            const sortedRoles = response.data.sort((a, b) =>
                a.role.localeCompare(b.role)
            );
            setRoles(sortedRoles); // Update state with sorted data
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };


    const handleAddRole = async () => {
        const token = sessionStorage.getItem('token'); // Retrieve the token
        if (!newRoleName) {
            setFormError('Role name is required.'); // Show validation error
            return;
        }
        try {
            setLoading(true);
            setFormError(''); // Clear any existing error
            const response = await axios.post(`${MAIN_API_BASE}/role`,
                {
                    role: newRoleName,
                    description: newRoleDescription,
                    access: newRoleAccess,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to headers
                    }
                }
            );
            setRoles([...roles, response.data.role]); // Update role list
            setNewRoleName(''); // Reset input fields
            setNewRoleDescription('');
            setNewRoleAccess('');
            setIsAddModalOpen(false); // Close the modal

            // Show success alert using SweetAlert2
            Swal.fire({
                title: 'Success!',
                text: 'Group has been added successfully.',
                icon: 'success',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error('Error adding role:', error);
            // Display server error message in the form
            if (error.response?.data?.message) {
                setFormError(error.response.data.message);
            } else {
                setFormError('Failed to add role.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const token = sessionStorage.getItem('token');  // Retrieve the token
        try {
            await axios({
                method: 'delete',
                url: `${MAIN_API_BASE}/role`,
                data: { id },
                headers: {
                    Authorization: `Bearer ${token}`,  // Add token to headers
                }
            });
            setRoles(roles.filter(role => role.role_id !== id));
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting role:', error);
            alert('Failed to delete role.');
        }
    };

    const confirmDelete = (role) => {
        setRoleToDelete(role);
        setIsDeleteModalOpen(true);
    };

    const handleDownloadExcel = () => {
        const formattedRoles = roles.map((role) => ({
            "Group Id ": role.role_id, 
            "Group Name": role.role, 
            "Description": role.description, 
        }));
        const worksheet = XLSX.utils.json_to_sheet(formattedRoles);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Roles');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'Groups.xlsx');
    };

    /*****************SEARCH TERM *******************/
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredRole = (roles || []).filter((role) => {
        const roleName = role.role || "";
        return (
            roleName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    /********************** PAgiantion *************** */
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25; // Adjust as needed
    const totalPages = Math.ceil(filteredRole.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Slice the filteredRole array for pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRoles = filteredRole.slice(startIndex, startIndex + itemsPerPage);
    /**********************END*******************/

    const handleGroupAssign = () => {
        navigate("/AccessPrivilege"); // Absolute path
    };

    const [hasAMSAccessGroup, setHasAMSAccessGroup] = useState(false);

    useEffect(() => {
        const checkAMSAccess = async () => {
            setLoading(true);
            try {
                const userId = sessionStorage.getItem('userId');
                if (!userId || !token) {
                    console.error('userId or token is missing');
                    return;
                }
                const response = await axios.get(`${MAIN_API_BASE}/access/access/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const userAccess = response.data;
                const hasGroupAccess = userAccess.some(access => access.module === 'ROLE');
                setHasAMSAccessGroup(hasGroupAccess);

            } catch (error) {
                if (error.response) {
                    console.error('API Response error:', error.response.data);
                    console.error('Status code:', error.response.status);
                } else if (error.request) {
                    console.error('No response received from API:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
                setHasAMSAccessGroup(false);
            } finally {
                setLoading(false);
            }
        };
        checkAMSAccess();
    }, []);

    return (
        <div className=" w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}> Add Group</AddButton>
                <div className="flex-grow">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search"
                        className="w-auto border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                {/* Logout Button */}
                {hasAMSAccessGroup && (
                    <button
                        onClick={handleGroupAssign}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
                    >
                        <FiLogOut className="w-5 h-5" />
                        <span>Assign Group</span>
                    </button>
                )}
                <button
                    onClick={handleDownloadExcel}
                    className="text-green-500 flex-shrink-0 sm:w-auto w-full text-center"
                >
                    <img src={excel} alt="logo" className="w-8 h-8 mx-auto" />
                </button>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-auto">
                        {formError && (<p className="text-red-500 mb-2"> {formError}</p>)}
                        <h2 className="text-xl font-bold mb-4">Create Group</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAddRole();
                        }}>
                            <div className="mb-4">
                                <label htmlFor="role">Group Name<span className='text-red-500'>*</span></label>
                                <input
                                    type="text"
                                    id="role"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Enter Group Name"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="description">Description</label>
                                <input
                                    type="text"
                                    id="description"
                                    value={newRoleDescription}
                                    onChange={(e) => setNewRoleDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Enter Description"
                                />
                            </div>
                            <div className="flex">
                                <button
                                    type="submit"
                                    className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${loading ? 'opacity-50' : ''}`}
                                    disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Group'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setFormError('');
                                        setNewRoleName('');
                                        setNewRoleDescription('');
                                        setNewRoleAccess('');
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
                    <div className="bg-white p-6 rounded-lg w-auto">
                        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                        <p>
                            Are you sure you want to delete the role: <strong>{roleToDelete?.role}</strong>?
                        </p>
                        <div className="flex justify-between mt-4">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(roleToDelete.role_id)} className="bg-red-500 text-white px-4 py-2 rounded">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/***************ROLE TABLE**************/}
            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                {/* Scrollable table section */}
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Group</th>
                                <th className="p-5 text-left text-black">Description</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {currentRoles.map((role, index) => (
                                <tr key={index} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{role.role}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{role.description || 'NA'}</td>
                                    <td className="px-5 py-4 text-left">
                                        <button onClick={() => confirmDelete(role)} className="text-red-600">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Sticky pagination at bottom of the fixed-height container */}
                {totalPages > 1 && (
                    <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-gray-100 border-t">
                        {/* Previous button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &lt;
                        </button>

                        {/* Current page display */}
                        <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                            {currentPage}
                        </span>
                        <span className="text-sm">of</span>
                        <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded text-sm">
                            {totalPages}
                        </span>

                        {/* Next button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default RoleTable;