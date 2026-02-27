import {DeleteIcon} from '../../NewComponents/ReactIcons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AddButton from '../../NewComponents/AddButton';
import { FaPlus } from "react-icons/fa";
import {HRMS_API_BASE} from '../../config/apiBase';

const CalenderLeave = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({
        year_type: '',
        start_date: '',
        end_date: '',
        description: '',
    });
    const [setFormErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [yearData, setYearData] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
    // Fetch year settings data
    const fetchYearData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${HRMS_API_BASE}/yrset/year`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setYearData(response.data);
        } catch (error) {
            console.error("Error fetching year data:", error);
        }
    };

    useEffect(() => {
        fetchYearData();
    }, []);

    // Toggle popup visibility and reset form
    const handleAddButtonClick = () => {
        setIsPopupOpen(true);
        setApiError(null);
    };

    const handleCancel = () => {
        setIsPopupOpen(false);
        setFormData({
            year_type: '',
            start_date: '',
            end_date: '',
            description: '',
        });
        setApiError(null);
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleYearSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.post(`${HRMS_API_BASE}/yrset/year`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (response.status === 201) {
                console.log('Year settings submitted successfully:', response.data);
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Year settings submitted successfully!',
                    confirmButtonText: 'OK'
                });
                setYearData((prevData) => [
                    ...prevData,
                    response.data
                ]);
                setIsPopupOpen(false);
                setFormData({
                    year_type: '',
                    start_date: '',
                    end_date: '',
                    description: '',
                });
            } else {
                setApiError(response.data.error || "An error occurred while submitting the year settings.");
            }
        } catch (error) {
            setApiError(error.response?.data.error || "An error occurred while submitting the year settings.");
        }
    };

    // Show confirmation popup before deleting
    const confirmDelete = (id) => {
        setDeleteConfirm({ show: true, id });
    };

    // Handle delete request
    const handleDelete = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`${HRMS_API_BASE}/yrset/year/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            console.log(`Year setting with ID ${id} deleted successfully`);
            setDeleteConfirm({ show: false, id: null });
            fetchYearData();
        } catch (error) {
            console.error("Error deleting year setting:", error);
            setApiError("An error occurred while deleting the year setting.");
        }
    };

    /****************** Pagination AND SEARCH ***************/
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedYear, setSelectedYear] = useState("All"); // Default to show all
    const rowsPerPage = 25;

    // Extract unique years from yearData
    const years = ["All", ...new Set(yearData.map(item => new Date(item.start_date).getFullYear()))];

    // Filter yearData based on the selected year
    const filteredData = selectedYear === "All"
        ? yearData
        : yearData.filter(item => new Date(item.start_date).getFullYear() === parseInt(selectedYear));

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentRows = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
        setCurrentPage(1); 
    };
    /********************END****************/
    return (
        <div className="overflow-x-auto">
            <div className="mb-4 flex flex-wrap items-center gap-4 mt-2">
                <AddButton onClick={handleAddButtonClick} icon={FaPlus}>Add Year Type</AddButton>
                <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                    <label htmlFor="yearFilter" className="text-gray-700"> Filter by Year: </label>
                    <select id="yearFilter" value={selectedYear} onChange={handleYearChange} className="border p-2 rounded w-full sm:w-auto" >
                        {years.map(year => (
                            <option key={year} value={year}> {year} </option>
                        ))}
                    </select>
                </div>
            </div>

            {/*********************TABLE*********************/}
            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Year Type</th>
                                <th className="p-5 text-left text-black">Start Date</th>
                                <th className="p-5 text-left text-black">End Date</th>
                                <th className="p-5 text-left text-black">Description</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {currentRows.map((item, index) => (
                                <tr key={index} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{item.year_type.charAt(0).toUpperCase() + item.year_type.slice(1)}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(item.start_date).toLocaleDateString("en-GB")}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(item.end_date).toLocaleDateString("en-GB")}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{item.description || "NA"}</td>
                                    <td className="px-5 py-4 text-left flex gap-2">
                                        <button className="text-red-500 hover:text-red-700 mr-2" onClick={() => confirmDelete(item.id)} > <DeleteIcon /> </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Sticky pagination at bottom of the fixed-height container */}
                <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-lightgray">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed" > &lt; </button>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
                    <span>of</span>
                    <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">{totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed" > &gt; </button>
                </div>
            </div>

            {isPopupOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Create Year Type</h2>
                        {apiError && <p className="text-red-600 mb-2">{apiError}</p>}
                        <form onSubmit={handleYearSubmit}>
                            <div className="mb-4">
                                <label htmlFor="year_type" className="block font-medium ">Year Type<span className='text-red-500'>*</span></label>
                                <select name="year_type" value={formData.year_type} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded" required >
                                    <option value="">Select Year Type</option>
                                    <option value="calendar">Calendar</option>
                                    <option value="financial">Financial</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="start_date" className="block font-medium"> Start Date<span className='text-red-500'>*</span> </label>
                                <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="end_date" className="block font-medium"> End Date<span className='text-red-500'>*</span> </label>
                                <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded" required />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="block font-medium">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded" rows="3" ></textarea>
                            </div>
                            <div className="flex justify-between">
                                <button type="button" onClick={handleCancel} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm.show && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this year setting?</p>
                        <div className="flex justify-between mt-4">
                            <button onClick={() => setDeleteConfirm({ show: false, id: null })} className="bg-gray-300 px-4 py-2 rounded" > Cancel </button>
                            <button onClick={() => handleDelete(deleteConfirm.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" > Delete </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default CalenderLeave;