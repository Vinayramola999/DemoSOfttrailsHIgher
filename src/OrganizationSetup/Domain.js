import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import excel from '../assests/excel.png';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import AddButton from "../NewComponents/AddButton";
import { FaPlus } from "react-icons/fa";
import { MAIN_API_BASE } from '../config/apiBase';

const DomainTable = () => {
    const navigate = useNavigate();
    const [domains, setDomains] = useState([]);
    const [newDomainName, setNewDomainName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [domainToDelete, setDomainToDelete] = useState(null);
    const token = sessionStorage.getItem('token');
    const [newDomainDescription, setNewDomainDescription] = useState('');

    const handleAddDomain = async () => {
        const token = sessionStorage.getItem('token');
        if (!newDomainName) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Domain name is required',
            });
            return;
        }
        try {
            setLoading(true);
            const response = await axios.post(`${MAIN_API_BASE}/domain`, {
                domain_name: newDomainName,
                description: newDomainDescription,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setDomains([...domains, response.data.domain]);
            setNewDomainName('');
            setNewDomainDescription('');
            setIsAddModalOpen(false);
            setError('');  // Clear any previous error    
            Swal.fire({
                icon: 'success',
                title: 'Domain Added',
                text: 'The domain has been added successfully!',
                timer: 3000,
                timerProgressBar: true,
            });
        } catch (error) {
            console.error('Error adding domain:', error);
            if (error.response && error.response.data && error.response.data.message) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes('already exists')) {
                    setError('Domain name already exists');
                } else {
                    setError(errorMessage);
                }
            } else {
                setError('Failed to add domain.');
            }
            // Show error message with SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'Error Adding Domain',
                text: error.response?.data?.message || 'Failed to add domain. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchDomains = async () => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.get(`${MAIN_API_BASE}/domain`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // Sort the data by `domain_name` alphabetically
            const sortedDomains = response.data.sort((a, b) => {
                if (a.domain_name.toLowerCase() < b.domain_name.toLowerCase()) return -1;
                if (a.domain_name.toLowerCase() > b.domain_name.toLowerCase()) return 1;
                return 0;
            });

            setDomains(sortedDomains);
        } catch (error) {
            console.error('Error fetching domains:', error);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    const handleDelete = async (id) => {
        const token = sessionStorage.getItem('token');
        try {
            await axios.delete(`${MAIN_API_BASE}/domain/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setDomains(domains.filter(domain => domain.dom_id !== id));
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting domain:', error);
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: error.response?.data?.message || 'Failed to delete domain.',
            });
        }
    };

    const confirmDelete = (domain) => {
        setDomainToDelete(domain);
        setIsDeleteModalOpen(true);
    };

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(domains);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Domains');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'Domains.xlsx');
    };

    const [searchTerm, setSearchTerm] = useState("");
    // Filter domains based on the search term
    const filteredDomains = domains.filter(
        (domain) =>
            domain.domain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (domain.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    /***********Pagination*************/
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15; // Adjust as needed
    const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Get the domains for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentDomains = filteredDomains.slice(startIndex, startIndex + itemsPerPage);
    /************************END *************** */
    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                {/* Add Domain Button */}
                <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Add Domain</AddButton>
                <div className="flex-grow">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search"
                        className="w-30 border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
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
                    <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-xs sm:max-w-md mx-4 sm:mx-6 lg:max-w-lg">
                        <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">Create Domain</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddDomain();
                            }}
                        >
                            <div className="mb-4">
                                <label htmlFor="domain">
                                    Domain Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="domain_name"
                                    value={newDomainName}
                                    onChange={(e) => setNewDomainName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base"
                                    placeholder="Enter Domain Name"
                                    required
                                />
                                {error && <div className="text-red-500 text-xs">{error}</div>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="description">Description</label>
                                <input
                                    type="text"
                                    id="description"
                                    value={newDomainDescription}
                                    onChange={(e) => setNewDomainDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base"
                                    placeholder="Enter Domain Description"
                                />
                            </div>
                            <div className="flex flex-wrap justify-between">
                                <button
                                    type="submit"
                                    className={"bg-custome-blue text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base mt-3 sm:mt-0"}
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add Domain '}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewDomainName(''); // Reset domain name field
                                        setNewDomainDescription(''); // Reset domain description field
                                        setError();
                                        setIsAddModalOpen(false); // Close the modal
                                    }}
                                    className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base mt-3 sm:mt-0"
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
                    <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-xs sm:max-w-md mx-4 sm:mx-0">
                        <h2 className="text-base sm:text-lg font-bold mb-4 text-center">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm sm:text-base text-center">
                            Are you sure you want to delete the domain:{" "}
                            <strong>{domainToDelete?.domain_name}</strong>?
                        </p>
                        <div className="flex justify-around mt-6 space-x-2 sm:space-x-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded w-full max-w-[100px] text-sm sm:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(domainToDelete.dom_id)}
                                className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded w-full max-w-[100px] text-sm sm:text-base"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/********************Domain Table************ */}
            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Domain</th>
                                <th className="p-5 text-left text-black">Description</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
                            {currentDomains.map((domain, index) => (
                                <tr key={index} className={`${index % 2 === 0 ? 'bg-tableblue' : 'bg-white'}`}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{domain.domain_name}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{domain.description || "NA"}</td>
                                    <td className="py-4 px-4 space-x-2"><button onClick={() => confirmDelete(domain)} className="text-red-500 hover:text-red-700"><FontAwesomeIcon icon={faTrash} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {totalPages > 1 && (
                <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2">
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
    )
}
export default DomainTable;