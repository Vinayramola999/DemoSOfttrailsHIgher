import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import excel from '../assests/excel.png'
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import FolderTree from "../assests/foldertree.png";
import AddButton from "../NewComponents/AddButton";
import SearchButton from "../NewComponents/SearchButton";
import { MAIN_API_BASE } from '../config/apiBase';
import { FaPlus } from "react-icons/fa";

const LocationsTable = () => {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [newLocationData, setNewLocationData] = useState({
        locality: '',
        country: '',
        state: '',
        city: '',
        code: '',
        remarks: ''
    });
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const allCountries = Country.getAllCountries();
        setCountries(allCountries);
    }, []);

    const handleCountryChange = (countryCode) => {
        setNewLocationData({
            ...newLocationData,
            country: countryCode,
            state: "",
            city: "",
        });
        const statesList = State.getStatesOfCountry(countryCode);
        setStates(statesList);
        setCities([]); // Reset cities
    };

    const handleStateChange = (stateCode) => {
        setNewLocationData({
            ...newLocationData,
            state: stateCode,
            city: "",
        });

        try {
            const cityList = City.getCitiesOfState(newLocationData.country, stateCode);
            setCities(cityList || []); // Use empty array as fallback
        } catch (error) {
            console.error("Error fetching cities:", error);
            const fallbackCities = City.getAllCities().filter(
                (city) =>
                    city.stateCode === stateCode &&
                    city.countryCode === newLocationData.country
            );
            setCities(fallbackCities);
        }
    };

    const [userData, setUserData] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddModalOpen1, setIsAddModalOpen1] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const [locationToDelete, setLocationToDelete] = useState(null);
    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token');

    const confirmDelete = (location) => {
        setLocationToDelete(location);
        setIsDeleteModalOpen(true);
    };

    const handleAddLocation = async () => {
        const { locality, country, state, city, code, remarks } = newLocationData;
        if (!locality || !country || !state || !city || !code || !remarks) {
            setFormError("All fields are required");
            return;
        }
        const getFullNameByCode = (code, list) => {
            const item = list.find((item) => item.isoCode === code || item.name === code);
            return item ? item.name : "";
        };
        const countryFullName = getFullNameByCode(country, countries);
        const stateFullName = getFullNameByCode(state, states);
        const cityFullName = getFullNameByCode(city, cities);
        const updatedLocationData = {
            ...newLocationData,
            country: countryFullName,
            state: stateFullName,
            city: cityFullName,
        };
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const response = await axios.post(`${MAIN_API_BASE}/loc`,
                updatedLocationData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setLocations([...locations, response.data.location]);
            setNewLocationData({ locality: "", country: "", state: "", city: "", code: "", remarks: "" });
            setIsAddModalOpen(false);
            setFormError("");
            Swal.fire({
                title: "Location Added!",
                text: "The new location has been successfully added.",
                icon: "success",
                confirmButtonText: "OK",
            });
        } catch (error) {
            console.error("Error adding location:", error);
            if (error.response && error.response.data.message) {
                const serverMessage = error.response.data.message;
                if (serverMessage.includes("already exists")) {
                    const localityMatch = serverMessage.match(/\(locality\)=\((.*?)\)/);
                    const existingLocality = localityMatch ? localityMatch[1] : "this locality";
                    Swal.fire({
                        title: "Error",
                        text: `The locality "${existingLocality}" already exists.`,
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                } else {
                    setFormError("Failed to add location.");
                }
            } else {
                setFormError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(locations);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Locations');

        // Create a buffer and save it as an Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'locations.xlsx');
    };

    useEffect(() => {
        const userId = sessionStorage.getItem("userId");
        console.log("UserId:", userId); // Check if userId is valid

        if (userId) {
            const fetchUserData = async () => {
                try {
                    console.log("Fetching data for userId:", userId); // Log before API call
                    const response = await axios.get(
                        `${MAIN_API_BASE}/users/id_user/${userId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log("API Response:", response);

                    if (response.data?.user) {
                        const user = response.data.user; // ✅ extract only the user object
                        console.log("User:", user);
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
    }, [token]);


    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const token = sessionStorage.getItem('token'); // Get token from sessionStorage

                const response = await axios.get(`${MAIN_API_BASE}/loc`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to request header
                    },
                });

                setLocations(response.data);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };
        fetchLocation();
    }, []);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [subLocationToDelete, setSubLocationToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState('');

    const openConfirmModal = (subLocationId) => {
        setSubLocationToDelete(subLocationId);
        setIsConfirmOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = sessionStorage.getItem("token");

            await axios.delete(`${MAIN_API_BASE}/loc/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLocations(locations.filter(location => location.location_id !== id)); // Remove the location from the list
            setIsDeleteModalOpen(false); // Close the modal after successful deletion
            setDeleteError(''); // Reset the error after successful deletion
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete location.';
            setDeleteError(errorMessage); // Store the error message in state
        }
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subLocations, setSubLocations] = useState([]);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        location: "",
        buildingNo: "",
        floorNo: "",
        roomDescription: "",
        otherDescription: "",
        section: ""
    });
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleOpenModal = async (location) => {
        setSelectedLocation(location);
        setIsModalOpen(true);
        setLoading(true);
        setError(null);

        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(
                `${MAIN_API_BASE}/sloc/${location.location_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSubLocations(response.data); // Directly set the fetched sub-locations
        } catch (err) {
            setError("Failed to fetch sub-locations.");
        } finally {
            setLoading(false);
        }
    };


    // Fetch locations from the API
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const token = sessionStorage.getItem("token"); // Get the token

                const response = await fetch(`${MAIN_API_BASE}/loc`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // Add the token in the Authorization header
                    },
                });

                const data = await response.json();
                setLocations(data);
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        };

        fetchLocations();
    }, []);


    //***********************  SUB LOCATION  ***************************/
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem("token");
            const payload = {
                location_id: newLocationData.location_id,
                building_no: formData.buildingNo,
                floor: formData.floorNo,
                room: formData.roomDescription,
                section: formData.section,
                description: formData.otherDescription,
            };
            const response = await fetch(`${MAIN_API_BASE}/sloc`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire({
                    title: "Success",
                    text: result.message,
                    icon: "success",
                    confirmButtonText: "OK",
                });
                setFormData({
                    buildingNo: "",
                    floorNo: "",
                    roomDescription: "",
                    otherDescription: "",
                    section: ""
                });
                setIsAddModalOpen1(false);
                setShowBuildingSuggestions(false);
                setShowFloorSuggestions(false);
                setShowSectionSuggestions(false);
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Failed to add sub-location",
                    icon: "error",
                    confirmButtonText: "Try Again",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "An error occurred while submitting the form",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsConfirmOpen(false);
        setSubLocationToDelete(null);
    };

    const handleDelete1 = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This sub-location will be permanently deleted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const token = sessionStorage.getItem("token");

                await axios.delete(
                    `${MAIN_API_BASE}/sloc/${subLocationToDelete}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setSubLocations((prev) =>
                    prev.filter((loc) => loc.sub_location_id !== subLocationToDelete)
                );
                setIsConfirmOpen(false);

                await Swal.fire(
                    'Deleted!',
                    'The sub-location has been deleted.',
                    'success'
                );
            } catch (error) {
                console.error("Failed to delete sub-location:", error);
                Swal.fire(
                    'Error!',
                    'Failed to delete sub-location. Please try again.',
                    'error'
                );
            }
        }
    };

    /*************************SEARCH TERM *********************/
    const [searchTerm, setSearchTerm] = useState("");
    const filteredLocations = locations.filter(
        (location) =>
            location.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (location.remarks && location.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    /*****************PAGINATION START ********************/
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15; // Adjust as needed
    const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLocations = filteredLocations.slice(startIndex, startIndex + itemsPerPage);

    //*****************SUggestions***************** *//
    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await axios.get(`${MAIN_API_BASE}/sloc`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const buildings = response.data.map((item) => item.building_no);
                setBuildingOptions([...new Set(buildings)]); // Remove duplicates
            } catch (error) {
                console.error("Error fetching buildings:", error);
            }
        };
        fetchBuildings();
    }, []);

    const [buildingOptions, setBuildingOptions] = useState([]);
    const [floorOptions, setFloorOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [filteredBuildings, setFilteredBuildings] = useState([]);
    const [filteredFloors, setFilteredFloors] = useState([]);
    const [filteredSections, setFilteredSections] = useState([]);
    const [showBuildingSuggestions, setShowBuildingSuggestions] = useState(false);
    const [showFloorSuggestions, setShowFloorSuggestions] = useState(false);
    const [showSectionSuggestions, setShowSectionSuggestions] = useState(false);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token"); // Get token from sessionStorage

                const response = await axios.get(`${MAIN_API_BASE}/sloc`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to header
                    },
                });

                const data = response.data;

                const buildings = [...new Set(data.map((item) => item.building_no))];
                const floors = [...new Set(data.map((item) => item.floor))];
                const sections = [...new Set(data.map((item) => item.section))];

                setBuildingOptions(buildings);
                setFloorOptions(floors);
                setSectionOptions(sections);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);


    // Generic function to handle suggestions
    const handleInputChange = (e, type) => {
        const { value } = e.target;
        setFormData((prev) => ({ ...prev, [type]: value }));

        if (type === "roomDescription" || type === "otherDescription") {
            return; // No need for suggestions, just update state
        }

        if (value.length > 0) {
            let filtered;
            switch (type) {
                case "buildingNo":
                    filtered = buildingOptions.filter((b) =>
                        b.toLowerCase().includes(value.toLowerCase())
                    );
                    setFilteredBuildings(filtered);
                    setShowBuildingSuggestions(true);
                    break;
                case "floorNo":
                    filtered = floorOptions.filter((f) =>
                        f.toLowerCase().includes(value.toLowerCase())
                    );
                    setFilteredFloors(filtered);
                    setShowFloorSuggestions(true);
                    break;
                case "section":
                    filtered = sectionOptions.filter((s) =>
                        s.toLowerCase().includes(value.toLowerCase())
                    );
                    setFilteredSections(filtered);
                    setShowSectionSuggestions(true);
                    break;
                default:
                    break;
            }
        } else {
            setShowBuildingSuggestions(false);
            setShowFloorSuggestions(false);
            setShowSectionSuggestions(false);
        }
    };

    const handleSuggestionClick = (type, value) => {
        setFormData({ ...formData, [type]: value });

        // Hide suggestions after selection
        switch (type) {
            case "buildingNo":
                setShowBuildingSuggestions(false);
                break;
            case "floorNo":
                setShowFloorSuggestions(false);
                break;
            case "section":
                setShowSectionSuggestions(false);
                break;
            default:
                break;
        }
    };

    //****************  Location Filter  ***********************//
    const [searchQuery, setSearchQuery] = useState(""); // Search query state
    const filteredSubLocations = subLocations.filter((subLoc) =>
        Object.values(subLoc)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const rowsPerPage = 100;
    const endIndex = startIndex + rowsPerPage;

    /********************* EDIT API  FOR SUBLOCATION  ***********************/
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editBuilding, setEditBuilding] = useState('');
    const [editFloor, setEditFloor] = useState('');
    const [editRoom, setEditRoom] = useState('');
    const [editSection, setEditSection] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [originalSubLoc, setOriginalSubLoc] = useState({});

    const handleEditClick = (subLoc) => {
        console.log("Editing sub location:", subLoc);
        setOriginalSubLoc(subLoc); // Save the original data
        setIsEditModalOpen(true);  // Open the modal
        setEditBuilding(subLoc.building_no || '');
        setEditFloor(subLoc.floor || '');
        setEditRoom(subLoc.room || '');
        setEditSection(subLoc.section || '');
        setEditDescription(subLoc.description || '');
        setEditStatus(subLoc.status || '');
    };

    const handleEditSubLocation = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedFields = {
                location_id: newLocationData.location_id, // Ensure newLocationData is defined or replace with the correct data.
            };
            if (editBuilding !== originalSubLoc.building_no) updatedFields.building_no = editBuilding;
            if (editFloor !== originalSubLoc.floor) updatedFields.floor = editFloor;
            if (editRoom !== originalSubLoc.room) updatedFields.room = editRoom;
            if (editSection !== originalSubLoc.section) updatedFields.section = editSection;
            if (editDescription !== originalSubLoc.description) updatedFields.description = editDescription;
            if (editStatus !== originalSubLoc.status) updatedFields.status = editStatus;

            if (Object.keys(updatedFields).length === 1) {
                Swal.fire({
                    icon: "info",
                    title: "No Changes",
                    text: "No changes were made!",
                    confirmButtonColor: "#3085d6",
                });
                setLoading(false);
                return;
            }

            const token = sessionStorage.getItem("token");
            const response = await fetch(`${MAIN_API_BASE}/sloc/${originalSubLoc.sub_location_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updatedFields),
            });

            if (!response.ok) throw new Error("Failed to update Sub Location");

            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Sub Location updated successfully!",
                confirmButtonColor: "#3085d6",
            });

            setIsEditModalOpen(false);
            fetchUpdatedSubLocations(); // Fetch updated data after editing

        } catch (error) {
            setFormError(error.message);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: error.message,
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch updated sub-location data
    const fetchUpdatedSubLocations = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch(`${MAIN_API_BASE}/sloc/${originalSubLoc.location_id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch sub locations");
            const data = await response.json();
            setSubLocations(data); // Update the table with new data
        } catch (error) {
            console.error("Error fetching sub locations:", error);
        }
    };

    useEffect(() => {
        fetchUpdatedSubLocations();
    }, []);

    /********************* EDIT API FOR LOCATION ************************/
    const [isEditModalOpen1, setIsEditModalOpen1] = useState(false);
    const [editLocality, setEditLocality] = useState('');
    const [editCountry, setEditCountry] = useState('');
    const [editState, setEditState] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editCode, setEditCode] = useState('');
    const [editRemark, setEditRemark] = useState('');
    const [editLocationStatus, setEditLocationStatus] = useState('');
    const [originalLoc, setOriginalLoc] = useState({});

    const handleEditClick1 = (Loc) => {
        console.log("Editing  location:", Loc);
        setIsEditModalOpen1(true);
        setOriginalLoc(Loc); // 
        setEditLocality(Loc.locality || '');
        setEditCountry(Loc.country || '');
        setEditState(Loc.state || '');
        setEditCity(Loc.city || '');
        setEditCode(Loc.code || '');
        setEditRemark(Loc.remarks || '');
        setEditLocationStatus(Loc.status || '');
    };

    const handleEditLocation = async (e, location) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedFields = {
                locality: editLocality,
                country: editCountry,
                state: editState,
                city: editCity,
                code: editCode,
                remarks: editRemark,
                status: editLocationStatus,
            };
            const token = sessionStorage.getItem("token");
            const response = await fetch(`${MAIN_API_BASE}/loc/${location.location_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updatedFields),
            });

            if (!response.ok) {
                throw new Error("Failed to update location");
            }

            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Location updated successfully!",
                confirmButtonColor: "#3085d6",
            });

            // Close modal
            setIsEditModalOpen1(false);

            // Fetch updated locations
            const locationsResponse = await fetch(`${MAIN_API_BASE}/loc`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const locationsData = await locationsResponse.json();
            setLocations(locationsData);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: error.message,
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isEditModalOpen1 && originalLoc) {
            setEditLocality(originalLoc.locality || "");
            setEditCountry(originalLoc.country || "");
            setEditState(originalLoc.state || "");
            setEditCity(originalLoc.city || "");
            setEditCode(originalLoc.code || "");
            setEditRemark(originalLoc.remarks || "");
            setEditLocationStatus(originalLoc.status || "");
        }
    }, [isEditModalOpen1, originalLoc]);

    /************************* COMBO BOX For ADD ******************* */
    const countryOptions = countries.map((country) => ({
        value: country.isoCode,
        label: country.name,
    }));

    const stateOptions = states.map((state) => ({
        value: state.isoCode,
        label: state.name,
    }));

    const cityOptions = cities.map((city) => ({
        value: city.name,
        label: city.name,
    }));
    /*******************END***************/

    return (
        <div className=" w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                {/* Add Location Button */}
                {/* <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-3xl hover:bg-custome-blue flex-shrink-0 sm:w-auto w-full text-center"
                >
                    Add Location
                </button> */}
                <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Add Location</AddButton>
                {/* Search Input */}
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
                    className="text-green-500 flex-shrink-0 w-full sm:w-[10%] text-center"
                >
                    <img src={excel} alt="logo" className="w-8 h-8 mx-auto" />
                </button>
            </div>

            {/* Add Location Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 sm:p-6 rounded-lg w-11/12 sm:w-1/3">
                        {formError && <p className="text-red-500 mb-4 text-sm sm:text-base">{formError}</p>}

                        <h2 className="text-lg sm:text-xl font-bold mb-4">Add Location</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAddLocation();
                        }}>
                            {/* Locality */}
                            <div className="mb-4">
                                <label htmlFor="locality" className="text-sm sm:text-base">
                                    Locality <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="locality"
                                    value={newLocationData.locality}
                                    onChange={(e) =>
                                        setNewLocationData({
                                            ...newLocationData,
                                            locality: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base"
                                    placeholder="Enter Locality"
                                />
                            </div>
                            {/* Country Dropdown */}
                            <div className="mb-4">
                                <label htmlFor="country" className="text-sm sm:text-base">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    id="country"
                                    value={countryOptions.find(option => option.value === newLocationData.country)}
                                    onChange={(selectedOption) => handleCountryChange(selectedOption.value)}
                                    options={countryOptions}
                                    isSearchable={true}
                                    className="w-full text-sm sm:text-base"
                                />
                            </div>
                            {/* State Combo Box */}
                            <div className="mb-4">
                                <label htmlFor="state" className="text-sm sm:text-base">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    id="state"
                                    value={stateOptions.find(option => option.value === newLocationData.state)}
                                    onChange={(selectedOption) => handleStateChange(selectedOption.value)}
                                    options={stateOptions}
                                    isSearchable={true}
                                    className="w-full text-sm sm:text-base"
                                    isDisabled={!stateOptions.length}
                                />
                            </div>
                            {/* City Combo Box */}
                            <div className="mb-4">
                                <label htmlFor="city" className="text-sm sm:text-base">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    id="city"
                                    value={cityOptions.find(option => option.value === newLocationData.city)}
                                    onChange={(selectedOption) =>
                                        setNewLocationData({
                                            ...newLocationData,
                                            city: selectedOption.value,
                                        })
                                    }
                                    options={cityOptions}
                                    isSearchable={true}
                                    className="w-full text-sm sm:text-base"
                                    isDisabled={!cityOptions.length}
                                />
                            </div>
                            {/* Code */}
                            <div className="mb-4">
                                <label htmlFor="code" className="text-sm sm:text-base">
                                    Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    value={newLocationData.code}
                                    onChange={(e) =>
                                        setNewLocationData({
                                            ...newLocationData,
                                            code: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base"
                                    placeholder="Enter Code"
                                />
                            </div>
                            {/* Remarks */}
                            <div className="mb-4">
                                <label htmlFor="remarks" className="text-sm sm:text-base">
                                    Remarks <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="remarks"
                                    value={newLocationData.remarks}
                                    onChange={(e) =>
                                        setNewLocationData({
                                            ...newLocationData,
                                            remarks: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base"
                                    placeholder="Enter Remarks"
                                />
                            </div>
                            {/* Buttons */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setNewLocationData({
                                            locality: '',
                                            country: '',
                                            state: '',
                                            city: '',
                                            code: '',
                                            remarks: '',
                                        });
                                        setFormError(null);
                                    }}
                                    className="mr-4 bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded text-sm sm:text-base"
                                >
                                    Add Location
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Location Modal */}
            {isDeleteModalOpen && locationToDelete && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                        {deleteError && (
                            <div className="text-red-500 mt-4">
                                <p>{deleteError}</p>
                            </div>
                        )}
                        <h2 className="text-xl font-bold mb-4">Delete Location</h2>
                        <p>Are you sure you want to delete the location: {locationToDelete.locality}?</p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false); // Close the modal
                                    setDeleteError(''); // Reset the error when modal is canceled
                                }}
                                className="mr-4 text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(locationToDelete.location_id)}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Locations Table */}
            <div className="overflow-x-auto rounded-lg">
                <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                    <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                        <table className="min-w-full table-auto border-collapse text-sm">
                            <thead className="text-[14px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
                                <tr>
                                    <th className="p-5 text-left text-black">S.No</th>
                                    <th className="p-5 text-left text-black">Locality</th>
                                    <th className="p-5 text-left text-black">Country</th>
                                    <th className="p-5 text-left text-black">State</th>
                                    <th className="p-5 text-left text-black">City</th>
                                    <th className="p-5 text-left text-black">Code</th>
                                    <th className="p-5 text-left text-black">Remarks</th>
                                    <th className="p-5 text-left text-black">Status</th>
                                    <th className="p-5 text-left text-black">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
                                {currentLocations.map((location, index) => (
                                    <tr key={index} className={`${index % 2 === 0 ? 'bg-tableblue' : 'bg-white'}`}>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-custome-blue underline cursor-pointer" onClick={() => handleOpenModal(location)}>{location.locality}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{location.country}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{location.state}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{location.city}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{location.code}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{location.remarks}</td>
                                        <td className={`py-4 px-5 text-[14px] font-semibold ${location.status === "Active" ? "text-green-600" : "text-red-600"}`}>{location.status}</td>
                                        <td className="py-4 px-4 space-x-2">
                                            <button onClick={() => handleEditClick1(location)} className="text-blue-500 hover:text-blue-700 "><FontAwesomeIcon icon={faEdit} /></button>
                                            <button onClick={() => confirmDelete(location)} className="text-red-500 hover:text-red-700 ml-2" > <FontAwesomeIcon icon={faTrash} /> </button>
                                            <button onClick={() => { setNewLocationData({ location_id: location.location_id }); setIsAddModalOpen1(true);  }} className="text-blue-500 hover:text-blue-700 ml-2" > <img src={FolderTree} alt="Sub Icon" className="w-5 h-5 inline" /> </button>
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

                        <span className="px-3 py-1 bg-blue-600 text-white rounded">
                            {currentPage}
                        </span>

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

            {isEditModalOpen1 && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 sm:p-6 rounded-lg w-[90%] max-w-md">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Edit Location</h2>
                            <button
                                onClick={() => setIsEditModalOpen1(false)}
                                className="text-red-500 text-lg sm:text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={(e) => handleEditLocation(e, originalLoc)}>
                            {/* Locality */}
                            <div className="mb-2">
                                <label htmlFor="locality" className="block font-medium mb-1">Locality</label>
                                <input
                                    type="text"
                                    id="locality"
                                    value={editLocality}
                                    onChange={(e) => setEditLocality(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>

                            {/* Country */}
                            <div className="mb-2">
                                <label htmlFor="country" className="block font-medium mb-1">Country</label>
                                <input
                                    type="text"
                                    id="country"
                                    value={editCountry}
                                    onChange={(e) => setEditCountry(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>

                            {/* State */}
                            <div className="mb-2">
                                <label htmlFor="state" className="block font-medium mb-1">State</label>
                                <input
                                    type="text"
                                    id="state"
                                    value={editState}
                                    onChange={(e) => setEditState(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>

                            {/* City */}
                            <div className="mb-2">
                                <label htmlFor="city" className="block font-medium mb-1">City</label>
                                <input
                                    type="text"
                                    id="city"
                                    value={editCity}
                                    onChange={(e) => setEditCity(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>

                            {/* Code */}
                            <div className="mb-2">
                                <label htmlFor="code" className="block font-medium mb-1">Code</label>
                                <input
                                    type="text"
                                    id="code"
                                    value={editCode}
                                    onChange={(e) => setEditCode(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>

                            {/* Remark */}
                            <div className="mb-2">
                                <label htmlFor="remark" className="block font-medium mb-1">Remark</label>
                                <input
                                    type="text"
                                    id="remark"
                                    value={editRemark}
                                    onChange={(e) => setEditRemark(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>

                            {/* Status Radio Buttons */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <div className="flex items-center space-x-4 mt-1">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="Active"
                                            checked={editLocationStatus === "Active"}
                                            onChange={() => setEditLocationStatus("Active")}
                                            className="form-radio text-blue-500"
                                        />
                                        <span>Active</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="Inactive"
                                            checked={editLocationStatus === "Inactive"}
                                            onChange={() => setEditLocationStatus("Inactive")}
                                            className="form-radio text-red-500"
                                        />
                                        <span>Inactive</span>
                                    </label>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen1(false);
                                        setEditLocality("");
                                        setEditCountry("");
                                        setEditState("");
                                        setEditCity("");
                                        setEditCode("");
                                        setEditRemark("");
                                        setEditLocationStatus("Active"); // Reset status to Active
                                    }}
                                    className="mr-4 text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/************************SUB--LOCATIONS*******************/}
            {/* Add Sub-Location Modal */}
            {isAddModalOpen1 && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 sm:p-6 rounded-lg w-[90%] max-w-md">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Add Sub Location</h2>
                            <button
                                onClick={() => setIsAddModalOpen1(false)}
                                className="text-red-500 text-lg sm:text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/*Building no. */}
                            <div className="mb-4 relative">
                                <label htmlFor="buildingNo" className="block font-medium mb-1">
                                    Building No.<span className="text-red-600">*</span>
                                </label>

                                <input
                                    type="text"
                                    id="buildingNo"
                                    name="buildingNo"
                                    value={formData.buildingNo}
                                    onChange={(e) => handleInputChange(e, "buildingNo")}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Enter or Select Building Name"
                                />
                                {showBuildingSuggestions && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-md">
                                        {filteredBuildings.length > 0 ? (
                                            filteredBuildings.map((b, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => handleSuggestionClick("buildingNo", b)}
                                                    className="p-2 cursor-pointer hover:bg-gray-200"
                                                >
                                                    {b}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="p-2 text-gray-500">No suggestions found</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                            {/* Floor No. */}
                            <div className="mb-4 relative">
                                <label htmlFor="floorNo" className="block font-medium mb-1">Floor No.</label>
                                <input
                                    type="text"
                                    id="floorNo"
                                    name="floorNo"
                                    value={formData.floorNo}
                                    onChange={(e) => handleInputChange(e, "floorNo")}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Enter or Select Floor No."
                                />
                                {showFloorSuggestions && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-md">
                                        {filteredFloors.length > 0 ? (
                                            filteredFloors.map((f, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => handleSuggestionClick("floorNo", f)}
                                                    className="p-2 cursor-pointer hover:bg-gray-200"
                                                >
                                                    {f}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="p-2 text-gray-500">No suggestions found</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                            {/* Section */}
                            <div className="mb-4 relative">
                                <label htmlFor="section" className="block font-medium mb-1">Section</label>
                                <input
                                    type="text"
                                    id="section"
                                    name="section"
                                    value={formData.section}
                                    onChange={(e) => handleInputChange(e, "section")}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Enter or Select Section"
                                />

                                {/* Suggestions */}
                                {showSectionSuggestions && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-md">
                                        {filteredSections.length > 0 ? (
                                            filteredSections.map((s, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => handleSuggestionClick("section", s)}
                                                    className="p-2 cursor-pointer hover:bg-gray-200"
                                                >
                                                    {s}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="p-2 text-gray-500">No suggestions found</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                            {/*Room */}
                            <div className="mb-4">
                                <label htmlFor="roomDescription" className="block font-medium mb-1">Room Description</label>
                                <input
                                    type="text"
                                    id="roomDescription"
                                    name="roomDescription"
                                    value={formData.roomDescription}
                                    onChange={(e) => handleInputChange(e, "roomDescription")}
                                    maxLength={40}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Enter Room Description"
                                />
                                {formData.roomDescription.length >= 40 && (
                                    <p className="text-red-500 text-sm mt-1">Maximum 40 characters allowed.</p>
                                )}
                            </div>
                            {/* Other Description */}
                            <div className="mb-4">
                                <label htmlFor="otherDescription" className="block font-medium mb-1">Other Description</label>
                                <textarea
                                    id="otherDescription"
                                    name="otherDescription"
                                    value={formData.otherDescription}
                                    onChange={(e) => handleInputChange(e, "otherDescription")}
                                    maxLength={40}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Add Other Description"
                                    rows={3}
                                ></textarea>
                                {formData.otherDescription.length >= 40 && (
                                    <p className="text-red-500 text-sm mt-1">Maximum 40 characters allowed.</p>
                                )}
                            </div>
                            {/* Buttons */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            buildingNo: "",
                                            floorNo: "",
                                            roomDescription: "",
                                            section: "",
                                            otherDescription: ""
                                        });
                                        setIsAddModalOpen1(false);
                                        setShowBuildingSuggestions(false);
                                        setShowFloorSuggestions(false);
                                        setShowSectionSuggestions(false);
                                    }}
                                    className="mr-4 text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Sub Location"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isConfirmOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm sm:max-w-md relative">
                        <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
                        <p className="mb-6">Are you sure you want to delete this sub-location?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCancel}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete1}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 sm:p-6 rounded-lg w-[90%] max-w-md">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Edit Sub Location</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-red-500 text-lg sm:text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleEditSubLocation}>
                            {/* Building No */}
                            <div className="mb-4">
                                <label htmlFor="buildingNo" className="block font-medium mb-1">
                                    Building No.<span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="buildingNo"
                                    value={editBuilding}
                                    onChange={(e) => setEditBuilding(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>
                            {/* Floor */}
                            <div className="mb-4">
                                <label htmlFor="floorNo" className="block font-medium mb-1">Floor No.</label>
                                <input
                                    type="text"
                                    id="floorNo"
                                    name="floorNo"
                                    value={editFloor}
                                    onChange={(e) => setEditFloor(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            {/* Room Description */}
                            <div className="mb-4">
                                <label htmlFor="roomDescription" className="block font-medium mb-1">Room Description</label>
                                <input
                                    type="text"
                                    id="roomDescription"
                                    name="roomDescription"
                                    value={editRoom}
                                    onChange={(e) => setEditRoom(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            {/* Section */}
                            <div className="mb-4">
                                <label htmlFor="section" className="block font-medium mb-1">Section</label>
                                <input
                                    type="text"
                                    id="section"
                                    name="section"
                                    value={editSection}
                                    onChange={(e) => setEditSection(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            {/* Other Description */}
                            <div className="mb-4">
                                <label htmlFor="otherDescription" className="block font-medium mb-1">Other Description</label>
                                <textarea
                                    id="otherDescription"
                                    name="otherDescription"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    rows={3}
                                ></textarea>
                            </div>
                            {/* Buttons */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="mr-4 text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Save Changes
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
                            Location: {selectedLocation.locality}
                        </h2>

                        {/* Search Filter */}
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-40 border border-gray-300 rounded-md p-2 mb-3"
                        />

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg shadow-inner border border-gray-300 overflow-y-auto max-h-[calc(5*48px)]">
                            <table className="min-w-full table-auto text-sm">
                                <thead className="bg-gray-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="py-3 px-4 border-b text-left">S.no.</th>
                                        <th className="py-3 px-4 border-b text-left">Building No.</th>
                                        <th className="py-3 px-4 border-b text-left">Floor</th>
                                        <th className="py-3 px-4 border-b text-left">Room</th>
                                        <th className="py-3 px-4 border-b text-left">Section</th>
                                        <th className="py-3 px-4 border-b text-left">Description</th>
                                        {/* <th className="py-3 px-4 border-b text-left">Status</th> */}
                                        <th className="py-3 px-4 border-b text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubLocations.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-3 text-center text-gray-500 bg-white border-b">
                                                No sub-location
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubLocations.slice(startIndex, endIndex).map((subLoc, index) => (
                                            <tr key={subLoc.sub_location_id} className={`border-t ${index % 2 === 0 ? "bg-blue-50" : "bg-white"}`}>
                                                <td className="p-3 border-b text-left">{startIndex + index + 1}</td>
                                                <td className="p-3 border-b text-left">{subLoc.building_no}</td>
                                                <td className="p-3 border-b text-left">{subLoc.floor || "NA"}</td>
                                                <td className="p-3 border-b text-left">{subLoc.room || "NA"}</td>
                                                <td className="p-3 border-b text-left">{subLoc.section || "NA"}</td>
                                                <td className="p-3 border-b text-left">{subLoc.description || "NA"}</td>
                                                {/* <td className={`p-3 border-b text-left font-semibold ${subLoc.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                                                    {subLoc.status}
                                                </td> */}
                                                <td className="p-3 border-b text-left">
                                                    <button
                                                        onClick={() => handleEditClick(subLoc)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button onClick={() => openConfirmModal(subLoc.sub_location_id)}
                                                        className="text-red-500 hover:text-red-700 ml-2">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>

                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center p-4">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-3 py-1 mx-1 rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default LocationsTable;