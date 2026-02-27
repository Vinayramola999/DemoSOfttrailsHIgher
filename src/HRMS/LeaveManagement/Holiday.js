import { useEffect, useState } from 'react';
import {DeleteIcon} from "../../NewComponents/ReactIcons";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import pdf from '../../assests/folder.png';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import AddButton from "../../NewComponents/AddButton";
import { FaPlus } from "react-icons/fa";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal"
import { HRMS_API_BASE ,MAIN_API_BASE} from "../../config/apiBase";

const Holiday = () => {
    const [isHolidayPopupOpen, setIsHolidayPopupOpen] = useState(false);
    const [holidays, setHolidays] = useState([]);
    const [apiError, setApiError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(null);
    const [availableYears, setAvailableYears] = useState([]);
    const [holidayFormData, setHolidayFormData] = useState({
        holiday_name: '',
        holiday_date: '',
        description: '',
    });

    const fetchHolidayData = async () => {
        try {
            const token = sessionStorage.getItem('token');

            const response = await axios.get(`${HRMS_API_BASE}/yrset/holidays`,
                { headers: { Authorization: `Bearer ${token}`, }, }
            );

            // 1️⃣ Sort holidays by date (ascending)
            const sortedHolidays = [...response.data].sort((a, b) => {
                return new Date(a.holiday_date) - new Date(b.holiday_date);
            });

            // 2️⃣ Extract unique years (latest first)
            const years = [
                ...new Set(
                    sortedHolidays.map(h =>
                        new Date(h.holiday_date).getFullYear()
                    )
                ),
            ].sort((a, b) => b - a);

            // 3️⃣ Save years list
            setAvailableYears(years);

            // 4️⃣ Auto-select latest year (only once)
            setSelectedYear(prevYear =>
                prevYear ? prevYear : years.length ? years[0] : null
            );

            // 5️⃣ Save holidays
            setHolidays(sortedHolidays);
        } catch (error) {
            setApiError('An error occurred while fetching holidays.');
        }
    };

    useEffect(() => {
        fetchHolidayData();
    }, []);

    const [hasAMSAccessAdd, setHasAMSAccessAdd] = useState(false);
    const [hasAMSAccessView, setHasAMSAccessView] = useState(false);
    const [hasAMSAccessDelete, setHasAMSAccessDelete] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    const handleHolidayChange = (e) => {
        const { name, value } = e.target;
        setHolidayFormData({
            ...holidayFormData,
            [name]: value,
        });
    };

    const handleHolidaySubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.post(`${HRMS_API_BASE}/yrset/holidays`, [holidayFormData], {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            Swal.fire({
                icon: 'success',
                title: 'Holiday Added!',
                text: 'The holiday has been successfully added.',
                confirmButtonText: 'Okay'
            });
            setIsHolidayPopupOpen(false);
            setHolidayFormData({
                holiday_name: '',
                holiday_date: '',
                description: '',
            });
            fetchHolidayData();
        } catch (error) {
            if (error.response && error.response.data) {
                Swal.fire({
                    icon: 'error',
                    title: error.response.data.error || 'Error',
                    text: error.response.data.message || 'Something went wrong',
                    confirmButtonText: 'Okay'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while adding the holiday.',
                    confirmButtonText: 'Okay'
                });
            }
        }
    };

    const handleCancel = () => {
        setIsHolidayPopupOpen(false);
        setHolidayFormData({
            holiday_name: '',
            holiday_date: '',
            description: '',
        });
        setApiError(null);
    };

    useEffect(() => {
        const checkAMSAccess = async () => {
            setLoading(true);
            try {
                const userId = sessionStorage.getItem('userId');
                const token = sessionStorage.getItem('token');

                if (!userId || !token) {
                    console.error('userId or token is missing');
                    return;
                }
                // Make the API call
                const response = await axios.get(`${MAIN_API_BASE}/access/access/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                console.log('Access API Response:', response.data);
                const userAccess = response.data;
                const hasAddAccess = userAccess.some(access => access.api_name === 'AddHoliday');
                const hasViewAccess = userAccess.some(access => access.api_name === 'ViewHoliday');
                const hasDeleteAccess = userAccess.some(access => access.api_name === 'DeleteHoliday');
                setHasAMSAccessAdd(hasAddAccess);
                setHasAMSAccessView(hasViewAccess);
                setHasAMSAccessDelete(hasDeleteAccess);
            } catch (error) {
                console.error('Error occurred during API call: ', error);
                if (error.response) {
                    console.error('API Response error:', error.response.data);
                    console.error('Status code:', error.response.status);
                } else if (error.request) {
                    console.error('No response received from API:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
                setHasAMSAccessAdd(false);
                setHasAMSAccessView(false);
                setHasAMSAccessDelete(false);
            } finally {
                setLoading(false);
            }
        };
        checkAMSAccess();
    }, []);

    /************************************************/
    // Generate PDF function (generic) - accepts a list of holidays
    const downloadPDF = (items = [], fileName = 'HolidaysList.pdf') => {
        const doc = new jsPDF();
        doc.text('Holiday List', 20, 10);
        doc.autoTable({
            head: [['S.no.', 'Holiday Name', 'Holiday Date']],
            body: (items || []).map((holiday, index) => {
                const formattedDate = new Date(holiday.holiday_date).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                });
                return [index + 1, holiday.holiday_name, formattedDate];
            }),
        });
        doc.save(fileName);
    };

    // Handlers for filtered / all downloads
    const handleDownloadFiltered = () => {
        const items = filteredHolidays && filteredHolidays.length ? filteredHolidays : holidays;
        const yearPart = selectedYear ? `_${selectedYear}` : '';
        downloadPDF(items, `HolidaysList_Filtered${yearPart}.pdf`);
    };

    const handleDownloadAll = () => {
        downloadPDF(holidays, 'HolidaysList_All.pdf');
    };

    // PDF menu state
    const [showPdfMenu, setShowPdfMenu] = useState(false);

    //PAGIANTION START
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItems, setCurrentItems] = useState([]);  // This should be initialized
    const itemsPerPage = 25;
    const [filteredHolidays, setFilteredHolidays] = useState([]);

    // Filter and Pagination
    const totalPages = Math.ceil(filteredHolidays.length / itemsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        const filtered = holidays.filter((holiday) => {
            const holidayYear = new Date(holiday.holiday_date).getFullYear();

            const matchesYear =
                !selectedYear || holidayYear === selectedYear;

            const matchesName =
                searchTerm === '' ||
                holiday.holiday_name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesMonth =
                selectedMonth === '' ||
                new Date(holiday.holiday_date).getMonth() + 1 === parseInt(selectedMonth);

            return matchesYear && matchesName && matchesMonth;
        });

        setFilteredHolidays(filtered);
        setCurrentPage(1);
    }, [searchTerm, selectedMonth, holidays, selectedYear]);

    useEffect(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        setCurrentItems(filteredHolidays.slice(indexOfFirstItem, indexOfLastItem));
    }, [currentPage, filteredHolidays]);

    /********************* DELETE ***************************/
    const [selectedHoliday, setSelectedHoliday] = useState(null);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!selectedHoliday) return;
        setIsDeleting(true);
        try {
            const token = sessionStorage.getItem('token');

            await axios.delete(`${HRMS_API_BASE}/yrset/holidays`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                data: {
                    holiday_name: selectedHoliday.holiday_name,
                    holiday_date: selectedHoliday.holiday_date,
                },
            });
            setIsDeletePopupOpen(false);
            setSelectedHoliday(null);
            fetchHolidayData(); // Refresh table
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete holiday."); // You can replace with toast or error UI
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="w-full ">
            <div className="flex justify-between items-center mb-4 mt-4">
                {hasAMSAccessAdd && (<AddButton onClick={() => setIsHolidayPopupOpen(true)} icon={FaPlus}> Add Holiday</AddButton>)}

                <div className="flex items-center justify-center gap-4">
                    <input type="text" placeholder="Search by Holiday Name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border rounded-md px-3 py-2" />
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border rounded-md px-3 py-2" >
                        <option value="">Filter by Month</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i + 1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <select value={selectedYear || ''} onChange={(e) => setSelectedYear(Number(e.target.value))} className="border rounded-md px-3 py-2" >
                        <option value="">Select Year</option>
                        {availableYears.map(year => (<option key={year} value={year}>{year}</option>))}
                    </select>
                </div>

                <div className="relative flex items-center gap-2 mr-5">
                    <button onClick={() => setShowPdfMenu(!showPdfMenu)} aria-haspopup="true" aria-expanded={showPdfMenu} title="Download PDF" className="text-red-600 hover:text-red-800 flex items-center">
                        <img src={pdf} alt="PDF" className="w-8 h-8" />
                    </button>
                    {showPdfMenu && (
                        <div className="absolute right-0 mt-10 w-44 bg-white border rounded shadow-lg z-50">
                            <button onClick={() => { handleDownloadAll(); setShowPdfMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">All Holidays</button>
                            <button onClick={() => { handleDownloadFiltered(); setShowPdfMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Filtered Holidays</button>
                        </div>
                    )}
                </div>
            </div>

            {isHolidayPopupOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Create Holiday</h2>
                        <form onSubmit={handleHolidaySubmit}>
                            <div className="mb-4">
                                <label htmlFor="holiday_name" className="block font-medium">Holiday Name <span className="text-red-500">*</span> </label>
                                <input type="text" name="holiday_name" value={holidayFormData.holiday_name} onChange={handleHolidayChange} className="w-full border border-gray-300 p-2 rounded" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="holiday_date" className="block font-medium">Holiday Date <span className="text-red-500">*</span> </label>
                                <input type="date" name="holiday_date" value={holidayFormData.holiday_date} onChange={handleHolidayChange} className="w-full border border-gray-300 p-2 rounded" required />
                            </div>
                            {apiError && <p className="text-red-500 mt-2">{apiError}</p>}
                            <div className="flex justify-end">
                                <button type="button" onClick={() => { handleCancel(); }} className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2">Cancel</button>
                                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmModal
                open={isDeletePopupOpen}
                title="Delete Holiday?"
                message={`Are you sure you want to delete "${selectedHoliday?.holiday_name}"?`}
                onCancel={() => { setIsDeletePopupOpen(false); setSelectedHoliday(null); }}
                onConfirm={handleDelete}
                loading={isDeleting}
            />

            {/* Table */}
            {hasAMSAccessView && (
                <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                    <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                        <table className="min-w-full table-auto border-collapse text-sm">
                            <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                                <tr>
                                    <th className="p-5 text-left text-black">S.No</th>
                                    <th className="p-5 text-left text-black">Holiday Name</th>
                                    <th className="p-5 text-left text-black">Holiday Date</th>
                                    {hasAMSAccessDelete && (<th className="p-5 text-left text-black">Action</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                                {currentItems.map((holiday, index) => (
                                    <tr key={index} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                                        <td className="px-5 py-4 text-left text-[14px] text-black"> {(currentPage - 1) * itemsPerPage + index + 1} </td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black"> {holiday.holiday_name} </td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">
                                            {new Date(holiday.holiday_date).toLocaleDateString('en-GB', {
                                                weekday: 'long',
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                            }).replace(/(\w+),?\s(\d{2})\s(\w+)\s(\d{4})/, '$1 | $2 $3 $4')}
                                        </td>
                                        {hasAMSAccessDelete && (
                                            <td className="px-5 py-4 text-left flex gap-2">
                                                <button className="text-red-500 hover:text-red-700 mr-2" onClick={() => { setSelectedHoliday(holiday); setIsDeletePopupOpen(true); }} > <DeleteIcon /> </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-lightgray">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed" > &lt; </button>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
                        <span>of</span>
                        <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">{totalPages}</span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed" > &gt; </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Holiday;