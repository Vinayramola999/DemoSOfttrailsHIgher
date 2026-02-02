import axios from 'axios';
import * as XLSX from 'xlsx';
import {
    validateFirstName,
    validateLastName,
    validatePhone,
    validateEmail,
} from '../Components/validate';
import Select from 'react-select';
import { saveAs } from 'file-saver';
import excel from '../assests/excel.png';
import UserDetailsPopup from './UserDetailsPop';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, } from '@fortawesome/free-solid-svg-icons';
import AddButton from "../NewComponents/AddButton";
import { FaPlus } from "react-icons/fa";
import MessageModal from "../NewComponents/MessageModal"; 
import { MAIN_API_BASE } from '../config/apiBase';

const Usermng = () => {
    const [departments, setDepartments] = useState([]);
    const [subdepartments, setSubDepartments] = useState([]);
    const [domains, setDomains] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [locations, setLocations] = useState([]);
    const [users, setUsers] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [designations, setDesignations] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [notification, setNotification] = useState({ message: '', color: '' });
    const [filteredSubDepartments, setFilteredSubDepartments] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [modalAddMessage, setModalAddMessage] = useState("");
    const [formErrors, setFormErrors] = useState({
        first_name: null,
        last_name: null,
        phone_no: null,
        email: null,
        dom_id: null,
        location_id: null,
        emp_id: null,
        user_status: null,
        desig_id: null,
        manager_id: null,
        gender: null,
        sub_id: null,
        dept_id: null,
        category_id: null,
        band: null,
    });
    const [formData, setFormData] = useState({
        user_id: '',
        first_name: '',
        last_name: '',
        phone_no: '',
        email: '',
        email_part2: '',
        dom_id: '',
        location_id: '',
        sub_id: '',
        emp_id: '',
        desig_id: '',
        manager_id: '',
        user_status: 'active',
        gender: '',
        dept_id: '',
        category_id: '',
        band: '',
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState('');

    const openConfirmPopup = (userId) => {
        setSelectedUserId(userId);
        setShowConfirm(true);
        setErrorMessage("");
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`${MAIN_API_BASE}/users`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                method: "DELETE",
                body: JSON.stringify({ id: selectedUserId }),
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(users.filter((user) => user.user_id !== selectedUserId));
                setShowConfirm(false);
            } else {
                if (data.message && data.message.includes("is still referenced from table")) {
                    setErrorMessage("This user is being used in the workflow. So, it cannot be deleted.");
                } else {
                    setErrorMessage(data.message || "Failed to delete user. Please try again.");
                }
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setErrorMessage("An unexpected error occurred. Please try again.");
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setSelectedUserId(null);
        setErrorMessage("");
    };

    useEffect(() => {
        fetchDepartments();
        fetchDesignations();
        fetchLocation();
        fetchUsers();
        fetchDomains();
        fetchSubDepartments();
    }, []);

    const fetchCommon = async (url, setter, itemName) => {
        try {
            const currentToken = sessionStorage.getItem('token');
            if (!currentToken) {

                return;
            }
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching ${itemName}:`, error);

        }
    };

    const fetchDepartments = () => fetchCommon(`${MAIN_API_BASE}/departments`, setDepartments, 'departments');
    const fetchSubDepartments = () => fetchCommon(`${MAIN_API_BASE}/sub_dept/sub_dept`, setSubDepartments, 'sub-departments');
    const fetchDesignations = () => fetchCommon(`${MAIN_API_BASE}/designation`, setDesignations, 'designations');
    const fetchLocation = () => fetchCommon(`${MAIN_API_BASE}/loc`, setLocations, 'locations');
    const fetchDomains = () => fetchCommon(`${MAIN_API_BASE}/domain`, setDomains, 'domains');

    const fetchUsers = async () => {
        try {
            const currentToken = sessionStorage.getItem('token');
            if (!currentToken) return;
            const response = await axios.get(`${MAIN_API_BASE}/users/getusers`, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            const sortedData = response.data.users.sort((a, b) =>
                (a.first_name || "").toLowerCase().localeCompare((b.first_name || "").toLowerCase())
            );
            setUsers(sortedData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let error = null;
        switch (name) {
            case 'first_name':
                error = validateFirstName(value);
                break;
            case 'last_name':
                error = validateLastName(value);
                break;
            case 'phone_no':
                error = validatePhone(value);
                break;
            case 'email':
                error = validateEmail(value);
                if (value.includes("@")) {
                    error = "@ should not be in email prefix.";
                } else {
                    error = null;
                }
                break;
            default:
                break;
        }
        setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    useEffect(() => {
        if (showEditModal) {
            fetchCategories();
        }
    }, [showEditModal]);

    const handleSignUp = async (e) => {
        e.preventDefault();
        let currentFormErrors = { ...formErrors };
        let formIsValid = true;

        // 🔹 Validation checks
        if (!formData.first_name.trim()) { currentFormErrors.first_name = "First Name is required."; formIsValid = false; }
        if (!formData.last_name.trim()) { currentFormErrors.last_name = "Last Name is required."; formIsValid = false; }

        if (!formData.phone_no.trim()) { currentFormErrors.phone_no = "Phone Number is required."; formIsValid = false; }
        else if (!/^\d{10}$/.test(formData.phone_no.trim())) { currentFormErrors.phone_no = "Phone Number must be 10 digits."; formIsValid = false; }

        if (!formData.email.trim()) { currentFormErrors.email = "Email prefix is required."; formIsValid = false; }
        else if (formData.email.includes("@")) { currentFormErrors.email = "@ not allowed in prefix."; formIsValid = false; }

        const selectedDomainForAdd = domains.find(d => String(d.dom_id) === String(formData.dom_id));
        if (!selectedDomainForAdd) { currentFormErrors.dom_id = "Email domain is required."; formIsValid = false; }

        if (!formData.category_id) { currentFormErrors.category_id = "User category is required."; formIsValid = false; }
        if (!formData.band) { currentFormErrors.band = "Band is required."; formIsValid = false; }

        if (!formData.emp_id.trim()) { currentFormErrors.emp_id = "Employee ID is required."; formIsValid = false; }
        if (!formData.manager_id) { currentFormErrors.manager_id = "Manager selection is required."; formIsValid = false; }
        if (!formData.dept_id) { currentFormErrors.dept_id = "Department is required."; formIsValid = false; }
        if (!formData.sub_id) { currentFormErrors.sub_id = "Verticals selection is required."; formIsValid = false; }
        if (!formData.location_id) { currentFormErrors.location_id = "Location is required."; formIsValid = false; }
        if (!formData.gender.trim()) { currentFormErrors.gender = "Gender is required."; formIsValid = false; }
        if (!formData.desig_id) { currentFormErrors.desig_id = "Designation is required."; formIsValid = false; }

        setFormErrors(currentFormErrors);
        if (!formIsValid) return;

        try {
            const emailForPayload = `${formData.email}@${selectedDomainForAdd.domain_name}`;
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone_no: formData.phone_no,
                email: emailForPayload,
                sub_id: parseInt(formData.sub_id),
                dept_id: parseInt(formData.dept_id),
                location: parseInt(formData.location_id),
                emp_id: formData.emp_id,
                gender: formData.gender,
                designation: parseInt(formData.desig_id),
                manager_id: parseInt(formData.manager_id),
                user_status: formData.user_status,
                category_id: parseInt(formData.category_id),
                band: parseInt(formData.band),
            };

            console.log("Signup payload:", payload);

            // Step 1: Sign up user
            const response = await axios.post(`${MAIN_API_BASE}/users/signup`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Signup response:", response.data);

            // ✅ Looser condition check for success message
            if (response.data.message?.includes('User registered successfully')) {
                const user_id = response.data.user?.user_id; // ✅ Correct key path

                console.log("Extracted user_id:", user_id);

                // Step 2: Create leave balance for the user
                if (user_id) {
                    try {
                        const leaveResponse = await axios.post(
                            `${MAIN_API_BASE}/leave/leave-balances`,
                            { user_id },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                        console.log("Leave balance API hit successfully:", leaveResponse.data);
                    } catch (leaveError) {
                        console.error("Error in leave balance API:", leaveError.response?.data || leaveError);
                    }
                } else {
                    console.error("User ID not found in signup response.");
                }

                // Step 3: Reset and refresh UI
                await fetchUsers();
                setIsAddModalOpen(false);
                setFormData({
                    user_id: '',
                    first_name: '',
                    last_name: '',
                    phone_no: '',
                    email: '',
                    dom_id: '',
                    location_id: '',
                    sub_id: '',
                    emp_id: '',
                    desig_id: '',
                    manager_id: '',
                    user_status: 'active',
                    gender: '',
                    dept_id: '',
                    category_id: '',
                    band: '',
                });
                setFormErrors({});
                setFilteredSubDepartments([]);
                setModalAddMessage("User registered successfully.");
            } else {
                setModalAddMessage(response.data.message || "Registration failed.");
            }
        } catch (error) {
            console.error('Error during registration:', error);
            let apiErrorMessage = "An error occurred. Please try again later.";

            if (error.response && error.response.data && error.response.data.message) {
                apiErrorMessage = error.response.data.message;
                let newErrors = {};

                if (apiErrorMessage.includes('Key (email)')) newErrors.email = 'Email already exists.';
                else if (apiErrorMessage.includes('Key (phone_no)')) newErrors.phone_no = 'Phone number already exists.';
                else if (apiErrorMessage.includes('Key (emp_id)')) newErrors.emp_id = 'Employee ID already exists.';

                setFormErrors(prev => ({ ...prev, ...newErrors }));
            }

            setModalAddMessage(apiErrorMessage);
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setSelectedUser(null);
    };

    const handleDepartmentChange = (e) => {
        const selectedDeptId = e.target.value;
        setFormData(prevData => ({
            ...prevData,
            dept_id: selectedDeptId,
            sub_id: "",
        }));
        if (selectedDeptId) {
            const filtered = subdepartments.filter(
                (subDept) => String(subDept.dept_id) === String(selectedDeptId)
            );
            setFilteredSubDepartments(filtered);
        } else {
            setFilteredSubDepartments([]);
        }
    };

    const handleDomainChangeForAddModal = (e) => {
        const selectedDomainId = e.target.value;
        const selectedDomain = domains.find(domain => String(domain.dom_id) === selectedDomainId);
        setFormData(prevData => ({
            ...prevData,
            dom_id: selectedDomainId,
            email_part2: selectedDomain ? selectedDomain.domain_name : '',
        }));
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            dom_id: selectedDomainId ? null : 'Domain is required.',
        }));
    };


    const handleDomainChangeForEditModal = (e) => {
        const selectedDomainId = e.target.value;
        setFormData(prevData => ({
            ...prevData,
            dom_id: selectedDomainId,
        }));
        setFormErrors(prev => ({ ...prev, dom_id: selectedDomainId ? null : 'Domain is required.' }));
    };


    const handleDownloadExcel = () => {
        const formattedUsers = users.map((user) => ({
            "User ID ": user.user_id, "Employee ID": user.emp_id, "First Name": user.first_name,
            "Last Name": user.last_name, "Email": user.email, "Phone no": user.phone_no,
            "Department": user.dept_name, "Verticals": user.sub_dept_name, "Location": user.locality,
            "Designation": user.designation, "Gender": user.gender, "Manager ID": user.manager_id,
            "User Status": user.user_status,
        }));
        const worksheet = XLSX.utils.json_to_sheet(formattedUsers);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'UserData.xlsx');
    };

    const handleStatusChange = (e) => {
        setFormData((prevData) => ({ ...prevData, user_status: e.target.value }));
    };

    const [loading, setLoading] = useState(true);
    const [hasAMSAccessAdd, setHasAMSAccessAdd] = useState(false);
    const [hasAMSAccessDelete, setHasAMSAccessDelete] = useState(false);
    
    const [hasAMSAccessEdit, setHasAMSAccessEdit] = useState(false);

    useEffect(() => {
        const checkAMSAccess = async () => {
            setLoading(true);
            try {
                const currentUserId = sessionStorage.getItem('userId');
                const currentToken = sessionStorage.getItem('token');
                if (!currentUserId || !currentToken) return;
                const response = await axios.get(`${MAIN_API_BASE}/access/access/${currentUserId}`, {
                    headers: { 'Authorization': `Bearer ${currentToken}` },
                });
                const userAccess = response.data;
                setHasAMSAccessAdd(userAccess.some(access => access.api_name === 'AddUM'));
                setHasAMSAccessDelete(userAccess.some(access => access.api_name === 'DltUM'));
                setHasAMSAccessEdit(userAccess.some(access => access.api_name === 'EditUM'));
            } catch (error) {
                console.error('Error checking AMS access: ', error);
            } finally {
                setLoading(false);
            }
        };
        checkAMSAccess();
    }, []);

    const sessionUserId = sessionStorage.getItem('userId');
    const [allUsersData, setAllUsersData] = useState([]);
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        if (sessionUserId && token) {
            const fetchAllUsersForManagerDropdown = async () => {
                try {
                    const response = await axios.get(`${MAIN_API_BASE}/users/getusers`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setAllUsersData(response.data.users);
                } catch (error) {
                    console.error('Error fetching all users data for dropdowns:', error);
                }
            };
            fetchAllUsersForManagerDropdown();
        }
    }, [sessionUserId, token]);


    const handleEditClick = (user) => {
        setFormErrors({});
        const emailParts = user.email ? user.email.split('@') : ['', ''];
        const domainObject = domains.find(d => d.domain_name === emailParts[1]);
        const departmentObject = departments.find(d => d.dept_name === user.dept_name);
        const locationObject = locations.find(l => l.locality === user.locality);
        const designationObject = designations.find(d => d.designation === user.designation);

        let deptId = departmentObject ? String(departmentObject.dept_id) : '';
        let subId = '';

        if (deptId) {
            const currentFilteredSubs = subdepartments.filter(
                (subDept) => String(subDept.dept_id) === deptId
            );
            setFilteredSubDepartments(currentFilteredSubs);
            const subDepartmentObject = currentFilteredSubs.find(sd => sd.sub_dept_name === user.sub_dept_name);
            subId = subDepartmentObject ? String(subDepartmentObject.sub_id) : '';
        } else {
            setFilteredSubDepartments([]);
        }
        console.log("Editing user:", user.category_id, user.band);
        setFormData({
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            emp_id: user.emp_id || '',
            phone_no: user.phone_no || '',
            email: emailParts[0] || '',
            dom_id: domainObject ? String(domainObject.dom_id) : '',
            manager_id: user.manager_id ? String(user.manager_id) : '',
            dept_id: deptId,
            sub_id: subId,
            location_id: locationObject ? String(locationObject.location_id) : '',
            desig_id: designationObject ? String(designationObject.desig_id) : '',
            user_status: user.user_status || 'active',
            gender: user.gender || '',
            email_part2: '',
            category_id: user.category_id ? String(user.category_id) : '',
            band: user.band ? String(user.band) : '',

        });
        setShowEditModal(true);
    };

const [modalMessage, setModalMessage] = useState(""); // for MessageModal

    const handleEdit = async () => {
        let currentEditErrors = {};
        let formIsValid = true;

        // Validation
        if (!formData.emp_id.trim()) { currentEditErrors.emp_id = "Employee ID is required."; formIsValid = false; }
        if (!formData.phone_no.trim()) { currentEditErrors.phone_no = "Phone Number is required."; formIsValid = false; }
        else if (!/^\d{10}$/.test(formData.phone_no.trim())) { currentEditErrors.phone_no = "Phone Number must be 10 digits."; formIsValid = false; }
        if (!formData.email.trim()) { currentEditErrors.email = "Email prefix is required."; formIsValid = false; }
        else if (formData.email.includes("@")) { currentEditErrors.email = " @ not allowed in prefix."; formIsValid = false; }

        const selectedDomainForEdit = domains.find(d => String(d.dom_id) === String(formData.dom_id));
        if (!selectedDomainForEdit) { currentEditErrors.dom_id = "Email domain is required."; formIsValid = false; }

        if (!formData.category_id) { currentEditErrors.category_id = "Category is required."; formIsValid = false; }
        if (!formData.band) { currentEditErrors.band = "Band is required."; formIsValid = false; }
        if (!formData.manager_id) { currentEditErrors.manager_id = "Manager is required."; formIsValid = false; }
        if (!formData.location_id) { currentEditErrors.location_id = "Location is required."; formIsValid = false; }
        if (!formData.dept_id) { currentEditErrors.dept_id = "Department is required."; formIsValid = false; }
        if (!formData.sub_id) { currentEditErrors.sub_id = "Verticals is required."; formIsValid = false; }
        if (!formData.desig_id) { currentEditErrors.desig_id = "Designation is required."; formIsValid = false; }

        setFormErrors(currentEditErrors);
        if (!formIsValid) return;

        setLoading(true);

        try {
            // Step 1: Update User
            const fullEmailForPayload = `${formData.email}@${selectedDomainForEdit.domain_name}`;
            const payload = {
                user_id: formData.user_id,
                emp_id: formData.emp_id,
                phone_no: formData.phone_no,
                email: fullEmailForPayload,
                manager_id: parseInt(formData.manager_id),
                sub_id: parseInt(formData.sub_id),
                dept_id: parseInt(formData.dept_id),
                location: parseInt(formData.location_id),
                user_status: formData.user_status,
                designation: parseInt(formData.desig_id),
                category: formData.category_id ? parseInt(formData.category_id) : null,
                band: formData.band ? parseInt(formData.band) : null,
            };

            const response = await axios.put(
                `${MAIN_API_BASE}/users/user/update`,
                payload,
                {
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                }
            );
            setLoading(false);
            if (response.data.message === "User updated successfully" || response.status === 200) {
                const updatedUserId = response.data.user.user_id;
                try {
                    await axios.post(
                        `${MAIN_API_BASE}/leave/leave-balances`,
                        { user_id: updatedUserId },
                        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
                    );
                } catch (leaveError) {
                    console.error("Leave balances API error:", leaveError.response?.data || leaveError);
                }

                // Step 3: Show success modal
                setModalMessage("User updated successfully!");

                await fetchUsers();
                handleCloseEditModal();
            } else {
                setModalMessage("Failed to update user.");
            }
        } catch (error) {
            setLoading(false);
            console.error("Error updating user:", error.response?.data || error);
            let apiErrorMessage = "An error occurred. Please try again.";
            if (error.response && error.response.data && error.response.data.message) {
                apiErrorMessage = error.response.data.message;
                if (apiErrorMessage.includes('Key (email)')) setFormErrors(prev => ({ ...prev, email: 'Email already exists.' }));
                else if (apiErrorMessage.includes('Key (phone_no)')) setFormErrors(prev => ({ ...prev, phone_no: 'Phone number already exists.' }));
                else if (apiErrorMessage.includes('Key (emp_id)')) setFormErrors(prev => ({ ...prev, emp_id: 'Employee ID already exists.' }));
            }
            setModalMessage(apiErrorMessage);
        }
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setFormData({
            user_id: '', first_name: '', last_name: '', phone_no: '', email: '', email_part2: '', dom_id: '',
            location_id: '', sub_id: '', emp_id: '', desig_id: '', manager_id: '',
            user_status: 'active', gender: '', dept_id: '',
        });
        setFormErrors({});
        setFilteredSubDepartments([]);
    };

    const handleSearch = (event) => setSearchTerm(event.target.value);

    const filteredUsers = users.filter(user =>
        ['first_name', 'last_name', 'emp_id', 'email', 'user_status', 'phone_no']
            .some(prop => user[prop] && user[prop].toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const managerOptionsForAdd = allUsersData.map(m => ({ value: m.user_id, label: `${m.first_name} ${m.last_name} (${m.email})` }));
    const locationOptionsForAdd = locations.map(l => ({ value: l.location_id, label: l.locality }));
    const designationOptionsForAdd = designations.map(d => ({ value: d.desig_id, label: d.designation }));


    const fetchCategories = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${MAIN_API_BASE}/user-category/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && Array.isArray(response.data.data)) {
                const options = response.data.data
                    .filter(cat => cat.status === 'active')
                    .map(cat => ({
                        value: cat.category_id,
                        label: cat.category
                    }));
                setCategoryOptions(options);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategoryOptions([]);
        }
    };

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);


    const bandOptions = [
        { value: 1, label: 'A' },
        { value: 2, label: 'B' },
        { value: 3, label: 'C' }
    ];

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                {hasAMSAccessAdd && (
                    <AddButton onClick={() => {
                        setFormData({
                            user_id: '', first_name: '', last_name: '', phone_no: '', email: '', email_part2: '', dom_id: '',
                            location_id: '', sub_id: '', emp_id: '', desig_id: '', manager_id: '',
                            user_status: 'active', gender: '', dept_id: '',
                        });
                        setFormErrors({});
                        setFilteredSubDepartments([]);
                        setNotification({ message: '', color: '' });
                        setIsAddModalOpen(true);
                    }} icon={FaPlus}> Add User</AddButton>)}
                <div className="flex-grow">
                    <input
                        type="text" value={searchTerm} onChange={handleSearch} placeholder="Search Users..."
                        className="w-auto border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button onClick={handleDownloadExcel} className="text-green-500 flex-shrink-0 w-auto sm:w-[10%] text-center" title="Download User Data">
                    <img src={excel} alt="Download Excel" className="w-8 h-8 mx-auto" />
                </button>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        {errorMessage && <p className="text-red-500 text-sm text-center mb-2">{errorMessage}</p>}
                        <h3 className="text-xl font-bold text-center text-gray-800">Confirm Deletion</h3>
                        <p className="text-gray-600 text-center mt-4">Are you sure you want to delete this user?</p>
                        <div className="flex justify-center gap-4 mt-6">
                            <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400" onClick={cancelDelete}>Cancel</button>
                            <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-3xl w-full max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                        {notification.message && (
                            <div className={`mb-4 p-3 text-center text-sm rounded ${notification.color === 'red' ? 'text-red-700 bg-red-100 border border-red-300' : 'text-green-700 bg-green-100 border border-green-300'}`}>
                                {notification.message}
                            </div>
                        )}
                        {formErrors.global && <div className="text-red-500 text-sm text-center mb-2">{formErrors.global}</div>}
                        <h2 className="text-xl font-bold mb-4 text-center">Create New User</h2>
                        <form onSubmit={handleSignUp}>
                            {/* First Name and Last Name */}
                            <div className="grid gap-4 mb-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="add_first_name" className="block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                                    <input id="add_first_name" name="first_name" value={formData.first_name} onChange={handleInputChange} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" placeholder="First Name" />
                                    {formErrors.first_name && <span className="text-red-500 text-xs">{formErrors.first_name}</span>}
                                </div>
                                <div>
                                    <label htmlFor="add_last_name" className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
                                    <input id="add_last_name" name="last_name" value={formData.last_name} onChange={handleInputChange} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" placeholder="Last Name" />
                                    {formErrors.last_name && <span className="text-red-500 text-xs">{formErrors.last_name}</span>}
                                </div>
                            </div>
                            {/* Phone and Email */}
                            <div className="grid gap-4 mb-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="add_phone_no" className="block text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                                    <input id="add_phone_no" name="phone_no" value={formData.phone_no} onChange={handleInputChange} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" placeholder="10-digit Phone" maxLength="10" />
                                    {formErrors.phone_no && <span className="text-red-500 text-xs">{formErrors.phone_no}</span>}
                                </div>
                                <div className='flex space-x-2'>
                                    <div className="flex-grow">
                                        <label htmlFor="add_email_prefix" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                                        <input id="add_email_prefix" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" placeholder="username" />
                                        {formErrors.email && <span className="text-red-500 text-xs">{formErrors.email}</span>}
                                    </div>
                                    <div className="w-2/5">
                                        <label htmlFor="add_dom_id" className="block text-sm font-medium text-gray-700">Domain <span className="text-red-500">*</span></label>
                                        <select id="add_dom_id" name="dom_id" value={formData.dom_id} onChange={handleDomainChangeForAddModal} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-[42px]">
                                            <option value="">@ Domain</option>
                                            {domains.map((d) => <option key={d.dom_id} value={d.dom_id}>@{d.domain_name}</option>)}
                                        </select>
                                        {formErrors.dom_id && <span className="text-red-500 text-xs">{formErrors.dom_id}</span>}
                                    </div>
                                </div>
                            </div>
                            {/* Employee ID and Manager */}
                            <div className="grid gap-4 mb-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="add_emp_id" className="block text-sm font-medium text-gray-700">Employee ID <span className="text-red-500">*</span></label>
                                    <input id="add_emp_id" name="emp_id" value={formData.emp_id} onChange={handleInputChange} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" placeholder="Employee ID" />
                                    {formErrors.emp_id && <span className="text-red-500 text-xs">{formErrors.emp_id}</span>}
                                </div>
                                <div>
                                    <label htmlFor="add_manager_id" className="block text-sm font-medium text-gray-700">Manager <span className="text-red-500">*</span></label>
                                    <Select inputId="add_manager_id" options={managerOptionsForAdd} value={managerOptionsForAdd.find(o => o.value === formData.manager_id)} onChange={(sel) => setFormData({ ...formData, manager_id: sel ? sel.value : "" })} placeholder="Select Manager" className="mt-1 w-full react-select-container" classNamePrefix="react-select" styles={{ control: (base) => ({ ...base, borderColor: '#A0AEC0', boxShadow: null, '&:hover': { borderColor: '#2B6CB0' } }) }} />
                                    {formErrors.manager_id && <span className="text-red-500 text-xs">{formErrors.manager_id}</span>}
                                </div>
                            </div>
                            {/* Department and Verticals */}
                            <div className="grid gap-4 mb-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="add_dept_id" className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                                    <select id="add_dept_id" name="dept_id" value={formData.dept_id} onChange={handleDepartmentChange} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => <option key={dept.dept_id} value={dept.dept_id}>{dept.dept_name}</option>)}
                                    </select>
                                    {formErrors.dept_id && <span className="text-red-500 text-xs">{formErrors.dept_id}</span>}
                                </div>
                                <div>
                                    <label htmlFor="add_sub_id" className="block text-sm font-medium text-gray-700">Verticals <span className="text-red-500">*</span></label>
                                    <select id="add_sub_id" name="sub_id" value={formData.sub_id} onChange={(e) => setFormData({ ...formData, sub_id: e.target.value })} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" disabled={!formData.dept_id || filteredSubDepartments.length === 0}>
                                        <option value="">Select Verticals</option>
                                        {formData.dept_id && filteredSubDepartments.length > 0 ? filteredSubDepartments.map(sub => <option key={sub.sub_id} value={sub.sub_id}>{sub.sub_dept_name}</option>) : formData.dept_id ? <option value="" disabled>No verticals</option> : <option value="" disabled>Select department first</option>}
                                    </select>
                                    {formErrors.sub_id && <span className="text-red-500 text-xs">{formErrors.sub_id}</span>}
                                </div>
                            </div>
                            {/* Location & Designation */}
                            <div className="grid gap-4 mb-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="add_location_id_label" className="block text-sm font-medium text-gray-700">Location <span className="text-red-500">*</span></label>
                                    <Select inputId="add_location_id_label" options={locationOptionsForAdd} value={locationOptionsForAdd.find(opt => opt.value === formData.location_id)} onChange={(sel) => setFormData({ ...formData, location_id: sel ? sel.value : "" })} placeholder="Select Location" className="mt-1 w-full react-select-container" classNamePrefix="react-select" isSearchable styles={{ control: (base) => ({ ...base, borderColor: '#A0AEC0', boxShadow: null, '&:hover': { borderColor: '#2B6CB0' } }) }} />
                                    {formErrors.location_id && <span className="text-red-500 text-xs">{formErrors.location_id}</span>}
                                </div>
                                <div>
                                    <label htmlFor="add_desig_id_label" className="block text-sm font-medium text-gray-700">Designation <span className="text-red-500">*</span></label>
                                    <Select inputId="add_desig_id_label" options={designationOptionsForAdd} value={designationOptionsForAdd.find(opt => opt.value === formData.desig_id)} onChange={(sel) => setFormData({ ...formData, desig_id: sel ? sel.value : "" })} placeholder="Select Designation" className="mt-1 w-full react-select-container" classNamePrefix="react-select" isSearchable styles={{ control: (base) => ({ ...base, borderColor: '#A0AEC0', boxShadow: null, '&:hover': { borderColor: '#2B6CB0' } }) }} />
                                    {formErrors.desig_id && <span className="text-red-500 text-xs">{formErrors.desig_id}</span>}
                                </div>
                            </div>
                            {/* Category & Band */}
                            <div className="grid gap-4 mb-4 md:grid-cols-2">
                                {/* User Category Dropdown */}
                                <div>
                                    <label htmlFor="add_category_id_label" className="block text-sm font-medium text-gray-700">User Category <span className="text-red-500">*</span></label>
                                    <Select
                                        inputId="add_category_id_label"
                                        options={categoryOptions} // fetched categories
                                        value={categoryOptions.find(opt => opt.value === formData.category_id) || null}
                                        onChange={(selectedOption) =>
                                            setFormData({ ...formData, category_id: selectedOption ? selectedOption.value : "" })
                                        }
                                        placeholder="Select User Category"
                                        className="mt-1 w-full react-select-container"
                                        classNamePrefix="react-select"
                                        isSearchable
                                    />
                                    {formErrors.category_id && <span className="text-red-500 text-xs">{formErrors.category_id}</span>}
                                </div>
                                {/* Band Dropdown */}
                                <div>
                                    <label htmlFor="add_band_label" className="block text-sm font-medium text-gray-700">
                                        Band <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        inputId="add_band_label"
                                        options={bandOptions}
                                        value={bandOptions.find(opt => opt.value === formData.band)}
                                        onChange={(selectedOption) =>
                                            setFormData({ ...formData, band: selectedOption ? selectedOption.value : "" })
                                        }
                                        placeholder="Select Band"
                                        className="mt-1 w-full react-select-container"
                                        classNamePrefix="react-select"
                                        isSearchable={false}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: '#A0AEC0',
                                                boxShadow: null,
                                                '&:hover': { borderColor: '#2B6CB0' }
                                            })
                                        }}
                                    />
                                    {formErrors.band && <span className="text-red-500 text-xs">{formErrors.band}</span>}
                                </div>
                            </div>
                            {/* Gender & Status */}
                            <div className="grid gap-4 mb-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="add_gender" className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
                                    <select id="add_gender" name="gender" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option><option value="Female">Female</option><option value="Others">Others</option>
                                    </select>
                                    {formErrors.gender && <span className="text-red-500 text-xs">{formErrors.gender}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">User Status <span className="text-red-500">*</span></label>
                                    <div className="flex items-center mt-2 space-x-4">
                                        <label className="inline-flex items-center"><input type="radio" name="user_status_add" value="active" checked={formData.user_status === "active"} onChange={handleStatusChange} className="form-radio h-4 w-4 text-blue-600" /><span className="ml-2 text-sm text-gray-700">Active</span></label>
                                        <label className="inline-flex items-center"><input type="radio" name="user_status_add" value="inactive" checked={formData.user_status === "inactive"} onChange={handleStatusChange} className="form-radio h-4 w-4 text-blue-600" /><span className="ml-2 text-sm text-gray-700">Inactive</span></label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => { setIsAddModalOpen(false); setFormErrors({}); setNotification({ message: '', color: '' }); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Add User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl md:max-w-2xl p-6 relative max-h-[90vh] scrollbar-hide overflow-y-auto">
                        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={handleCloseEditModal} aria-label="Close">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <h2 className="text-xl font-bold mb-6 text-center">Edit User Details</h2>

                        {/* Non-Editable Fields Display */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">First Name</label>
                                <p className="mt-0.5 text-sm text-gray-800">{formData.first_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Last Name</label>
                                <p className="mt-0.5 text-sm text-gray-800">{formData.last_name || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="grid gap-4 mb-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="edit_emp_id" className="block text-sm font-medium text-gray-700">Employee ID <span className="text-red-500">*</span></label>
                                <input id="edit_emp_id" name="emp_id" value={formData.emp_id} onChange={handleInputChange} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm text-sm" placeholder="Employee ID" />
                                {formErrors.emp_id && <span className="text-red-500 text-xs">{formErrors.emp_id}</span>}
                            </div>
                            <div>
                                <label htmlFor="edit_phone_no" className="block text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                                <input id="edit_phone_no" name="phone_no" value={formData.phone_no} onChange={handleInputChange} maxLength="10" className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm text-sm" placeholder="10-digit Phone" />
                                {formErrors.phone_no && <span className="text-red-500 text-xs">{formErrors.phone_no}</span>}
                            </div>
                        </div>
                        <div className='grid gap-4 mb-4 md:grid-cols-2'>
                            <div >
                                <label htmlFor="edit_email_prefix" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                                <input id="edit_email_prefix" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm text-sm" placeholder="username" />
                                {formErrors.email && <span className="text-red-500 text-xs">{formErrors.email}</span>}
                            </div>
                            <div >
                                <label htmlFor="edit_dom_id" className="block text-sm font-medium text-gray-700">Domain <span className="text-red-500">*</span></label>
                                <select id="edit_dom_id" name="dom_id" value={formData.dom_id} onChange={handleDomainChangeForEditModal} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm text-sm h-[42px]">
                                    <option value="">@ Domain</option>
                                    {domains.map((d) => <option key={d.dom_id} value={String(d.dom_id)}>@{d.domain_name}</option>)}
                                </select>
                                {formErrors.dom_id && <span className="text-red-500 text-xs">{formErrors.dom_id}</span>}
                            </div>
                        </div>
                        {/* Other editable fields like Manager, Location, Department etc. */}
                        <div className="grid gap-4 mb-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="edit_manager_id" className="block text-sm font-medium text-gray-700">Manager <span className="text-red-500">*</span></label>
                                <select id="edit_manager_id" name="manager_id" value={formData.manager_id} onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm text-sm">
                                    <option value="">Select Manager</option>
                                    {allUsersData.map(m => <option key={m.user_id} value={String(m.user_id)}>{m.first_name} {m.last_name} ({m.email})</option>)}
                                </select>
                                {formErrors.manager_id && <span className="text-red-500 text-xs">{formErrors.manager_id}</span>}
                            </div>
                            <div>
                                <label htmlFor="edit_location_id" className="block text-sm font-medium text-gray-700">Location <span className="text-red-500">*</span></label>
                                <select id="edit_location_id" name="location_id" value={formData.location_id} onChange={(e) => setFormData({ ...formData, location_id: e.target.value })} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm text-sm">
                                    <option value="">Select Location</option>
                                    {locations.map(l => <option key={l.location_id} value={String(l.location_id)}>{l.locality}</option>)}
                                </select>
                                {formErrors.location_id && <span className="text-red-500 text-xs">{formErrors.location_id}</span>}
                            </div>
                        </div>
                        <div className="grid gap-4 mb-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="edit_dept_id" className="block text-sm font-medium text-gray-700">Department <span className='text-red-500'>*</span></label>
                                <select id="edit_dept_id" name="dept_id" value={formData.dept_id} onChange={handleDepartmentChange} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm text-sm">
                                    <option value="">Select Department</option>
                                    {departments.map(dept => <option key={dept.dept_id} value={String(dept.dept_id)}>{dept.dept_name}</option>)}
                                </select>
                                {formErrors.dept_id && <span className="text-red-500 text-xs">{formErrors.dept_id}</span>}
                            </div>
                            <div>
                                <label htmlFor="edit_sub_id" className="block text-sm font-medium text-gray-700">Verticals <span className="text-red-500">*</span></label>
                                <select id="edit_sub_id" name="sub_id" value={formData.sub_id} onChange={(e) => setFormData({ ...formData, sub_id: e.target.value })} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm text-sm" disabled={!formData.dept_id || filteredSubDepartments.length === 0}>
                                    <option value="">Select Verticals</option>
                                    {formData.dept_id && filteredSubDepartments.length > 0 ? filteredSubDepartments.map(sub => <option key={sub.sub_id} value={String(sub.sub_id)}>{sub.sub_dept_name}</option>) : formData.dept_id ? <option value="" disabled>No verticals</option> : <option value="" disabled>Select department</option>}
                                </select>
                                {formErrors.sub_id && <span className="text-red-500 text-xs">{formErrors.sub_id}</span>}
                            </div>
                        </div>
                        <div className="grid gap-4 mb-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="edit_desig_id" className="block text-sm font-medium text-gray-700">Designation <span className="text-red-500">*</span></label>
                                <select id="edit_desig_id" name="desig_id" value={formData.desig_id} onChange={(e) => setFormData({ ...formData, desig_id: e.target.value })} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm text-sm">
                                    <option value="">Select Designation</option>
                                    {designations.map(d => <option key={d.desig_id} value={String(d.desig_id)}>{d.designation}</option>)}
                                </select>
                                {formErrors.desig_id && <span className="text-red-500 text-xs">{formErrors.desig_id}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">User Status <span className="text-red-500">*</span></label>
                                <div className="flex items-center mt-2 space-x-4">
                                    <label className="inline-flex items-center"><input type="radio" name="edit_user_status" value="active" checked={formData.user_status === "active"} onChange={handleStatusChange} className="form-radio h-4 w-4 text-blue-600" /><span className="ml-2 text-sm">Active</span></label>
                                    <label className="inline-flex items-center"><input type="radio" name="edit_user_status" value="inactive" checked={formData.user_status === "inactive"} onChange={handleStatusChange} className="form-radio h-4 w-4 text-blue-600" /><span className="ml-2 text-sm">Inactive</span></label>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-4 mb-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="edit_category" className="block text-sm font-medium text-gray-700">User Category<span className="text-red-500">*</span></label>
                                <select id="edit_category" name="category_id" value={formData.category_id || ""} onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm text-sm" >
                                    <option value="">Select Category</option>
                                    {categoryOptions.map((cat) => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="edit_band" className="block text-sm font-medium text-gray-700">Band</label>
                                <select id="edit_band" name="band" value={formData.band || ""} onChange={(e) => setFormData({ ...formData, band: parseInt(e.target.value) })} className="mt-1 w-full border border-gray-400 rounded-md p-2 shadow-sm text-sm" >
                                    <option value="">Select Band</option>
                                    {bandOptions.map((b) => (<option key={b.value} value={b.value}> {b.label} </option>))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button disabled={loading} className={`px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`} onClick={handleEdit}>
                                {loading ? "Updating..." : "Update User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0 z-10" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Emp. ID</th>
                                <th className="p-5 text-left text-black">Username</th>
                                <th className="p-5 text-left text-black">Phone </th>
                                <th className="p-5 text-left text-black">Email</th>
                                <th className="p-5 text-left text-black">Department</th>
                                <th className="p-5 text-left text-black">Status</th>
                                {(hasAMSAccessDelete || hasAMSAccessEdit) && <th className="p-5 text-left text-black">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {currentUsers.map((user, index) => (
                                <tr key={user.user_id} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{user.emp_id}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-blue-600 cursor-pointer" onClick={() => handleUserClick(user)} title="View User Details">{user.first_name} {user.last_name}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{user.phone_no}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{user.email}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{user.dept_name}</td>
                                    <td className={`py-3 px-4 font-medium ${user.user_status === "active" ? "text-green-600" : "text-red-600"}`}>{user.user_status === "active" ? "Active" : "Inactive"}</td>
                                    {(hasAMSAccessDelete || hasAMSAccessEdit) && (
                                        <td className="py-3 px-4 text-left">
                                            {hasAMSAccessEdit && <button className="text-blue-500 mr-3 p-1 rounded" onClick={() => handleEditClick(user)} title="Edit User"><FontAwesomeIcon icon={faEdit} /></button>}
                                            {hasAMSAccessDelete && <button className="text-red-500 p-1 rounded " onClick={() => openConfirmPopup(user.user_id)} title="Delete User"><FontAwesomeIcon icon={faTrash} /></button>}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Sticky pagination at bottom of the fixed-height container */}
                {totalPages > 1 && (
                    <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-gray-100">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &lt;
                        </button>

                        <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                            {currentPage}
                        </span>

                        <span className="text-sm">of</span>

                        <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded text-sm">
                            {totalPages}
                        </span>

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

            <MessageModal message={modalAddMessage} type="success" setMessage={setModalAddMessage} />
            <MessageModal message={modalMessage} type="success" setMessage={setModalMessage} />
            {isPopupOpen && selectedUser && <UserDetailsPopup user={selectedUser} onClose={closePopup} />}
        </div>
    );
};
export default Usermng;