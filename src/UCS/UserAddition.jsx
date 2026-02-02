import React, { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import axios from "axios";
import UserDataTable from './UserDataTable';
import UpdateModal from './UpdateModal';
import { FaTimes } from 'react-icons/fa';
import Select from "react-select";
// API URLs
const API_URLS = {
  modules: "https://ucsdemo.softtrails.net/api/modules",
  tableNames: "https://ucsdemo.softtrails.net/api/modules/table-names"
};

// Reusable Component for Select-or-Input functionality.
const CustomizableSelect = ({
  label,
  id,
  value,
  customValue,
  onChange,
  onCustomChange,
  options,
  disabled = false,
  placeholder = "Enter new value",
  required = false

}) => {
  if (value === 'custom') {
    return (
      <div>
        {/* <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label> */}

        <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={placeholder}
            className="w-full px-4 py-2 border rounded-lg"
            value={customValue}
            onChange={(e) => onCustomChange(id, e.target.value)}
            autoFocus
          />
          <button
            type="button"
            className="text-red-500 hover:text-red-700 ml-4"
            onClick={() => onChange({ target: { id, value: '' } })}
            aria-label="Remove item">
            <FaTimes />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      >
        <option value="">Select {label}</option>
        {options.map((opt, index) => (
          <option key={index} value={opt}>{opt}</option>
        ))}
        {!disabled && <option value="custom">+ Add New</option>}
      </select>
    </div>
  );
};

// Main UserAddition Component.
const UserAddition = () => {
  const initialFormData = {
    name: '',
    moduleName: '',
    subModuleName: '',
    uniqueIdentifierName: '',
    tableName: '',
  };

  // filter state for modules table (module-name based)
  const [tableFilter, setTableFilter] = useState("");

  const [formData, setFormData] = useState(initialFormData);
  const [allModulesData, setAllModulesData] = useState([]);

  const [customFields, setCustomFields] = useState({
    name: '',
    moduleName: '',
    subModuleName: ''
  });
  const [tableData, setTableData] = useState([]);

  // ✅ Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItemToUpdate, setCurrentItemToUpdate] = useState(null);

  const getAllModules = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const url = API_URLS.modules;
      const res = await axios.get(url, { headers });
      const fetchedData = res.data || [];
      setAllModulesData(fetchedData);

      setTableData(fetchedData);
    } catch (error) {
      console.error("Error fetching modules:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Data',
        text: 'Could not fetch module data from the server.',
      });
    }
  };

  const [tableNames, setTableNames] = useState([]);
  // ✅ React-Select requires options format
  const tableOptions = tableNames.map((tName) => ({
    value: tName,
    label: tName
  }));
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    fetchData(API_URLS.modules, (data) => {
      setAllModulesData(data);
      setTableData(data);
    }, headers);
    fetchData(API_URLS.tableNames, setTableNames, headers);
  }, []);

  // --- Cascading Dropdowns Logic ---
  const applicationNames = useMemo(() => {
    return [...new Set(allModulesData.map(item => item.applicationName))];
  }, [allModulesData]);

  const moduleNames = useMemo(() => {
    if (!formData.name || formData.name === 'custom') return [];
    return [...new Set(allModulesData.filter(item => item.applicationName === formData.name).map(item => item.moduleName).filter(Boolean))];
  }, [allModulesData, formData.name]);

  const subModuleNames = useMemo(() => {
    if (!formData.name || !formData.moduleName || formData.moduleName === 'custom') return [];
    return [...new Set(allModulesData.filter(item => item.applicationName === formData.name && item.moduleName === formData.moduleName).map(item => item.subModuleName).filter(Boolean))];
  }, [allModulesData, formData.name, formData.moduleName]);

  // --- Form Handlers ---
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => {
      const newData = { ...prevData, [id]: value };
      if (id === 'name') {
        newData.moduleName = '';
        newData.subModuleName = '';
        setCustomFields(prev => ({ ...prev, moduleName: '', subModuleName: '' }));
      }
      if (id === 'moduleName') {
        newData.subModuleName = '';
        setCustomFields(prev => ({ ...prev, subModuleName: '' }));
      }
      if (value === '') {
        setCustomFields(prev => ({ ...prev, [id]: '' }));
      }
      return newData;
    });
  };

  const handleCustomFieldChange = (field, value) => {
    setCustomFields(prev => ({ ...prev, [field]: value }));
  };

  const getFinalValue = (key) => {
    return formData[key] === 'custom' ? customFields[key] : formData[key];
  };

  // ✅ Modal Handlers
  const handleUpdateClick = (item) => {
    setCurrentItemToUpdate(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItemToUpdate(null);
  };

  // ✅ Update API Call
  const handleSaveUpdate = async (updatedData) => {
    const { id } = updatedData;
    const url = `https://ucsdemo.softtrails.net/api/modules/${id}`;

    try {
      const token = sessionStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.put(url, updatedData, { headers });
      if (response.status === 200) {
        Swal.fire('Success!', 'Module updated successfully.', 'success');
        handleCloseModal();
        getAllModules();
      } else {
        throw new Error('Failed to update.');
      }
    } catch (error) {
      console.error("Error updating module:", error);
      Swal.fire('Error!', 'Could not update the module.', 'error');
    }
  };

  const handleTableSelect = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      tableName: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalApplicationName = getFinalValue('name');
    const finalModuleName = getFinalValue('moduleName');
    const finalSubModuleName = getFinalValue('subModuleName');

    if (!finalApplicationName || !finalModuleName || !formData.uniqueIdentifierName) {
      let missingFields = [];
      if (!finalApplicationName) missingFields.push('Application Name');
      if (!finalModuleName) missingFields.push('Module Name');
      if (!formData.uniqueIdentifierName) missingFields.push('Unique Identifier');

      Swal.fire({
        icon: 'error',
        title: 'Fields Required',
        text: `${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required.`,
      });
      return;
    }

    const payload = {
      applicationName: finalApplicationName,
      moduleName: finalModuleName,
      subModuleName: finalSubModuleName,
      uniqueIdentifierName: formData.uniqueIdentifierName,
      tableName: Array.isArray(formData.tableName)
        ? formData.tableName.join(",")
        : formData.tableName,
    };


    try {
      const token = sessionStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await fetch(API_URLS.modules, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        // Try to get created record from response body
        let created = null;
        try {
          created = await response.json();
        } catch (e) {
          // ignore - backend might not return body
        }

        Swal.fire({ icon: 'success', title: 'Success!', text: 'Data submitted successfully!' });

        // If backend returned the created item use it; otherwise build a local representation
        const fallbackItem = {
          id: `temp-${Date.now()}`,
          applicationName: payload.applicationName || '',
          moduleName: payload.moduleName || '',
          subModuleName: payload.subModuleName || '',
          uniqueIdentifierName: payload.uniqueIdentifierName || '',
          tableName: payload.tableName || '',
          createdAt: new Date().toISOString(),
        };

        const newItem = created && typeof created === 'object' && Object.keys(created).length
          ? created
          : fallbackItem;

        // Prepend optimistic item so it appears immediately
        setTableData(prev => Array.isArray(prev) ? [newItem, ...prev.filter(i => i.id !== newItem.id)] : [newItem]);
        setAllModulesData(prev => Array.isArray(prev) ? [newItem, ...prev.filter(i => i.id !== newItem.id)] : [newItem]);

        // Reset local filter so newly added row is visible even if a filter was active
        setTableFilter("");

        // Re-fetch from server to replace optimistic item with canonical data (fixes N/A or shape mismatches)
        // Use small delay to give backend time to persist if needed
        setTimeout(() => {
          getAllModules();
        }, 700);

        // reset form
        setFormData(initialFormData);
        setCustomFields({ name: '', moduleName: '', subModuleName: '' });

        // Optionally you can still refresh from server after a short delay to sync (uncomment if needed)
        // setTimeout(getAllModules, 1000);
      } else {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Submission failed!');
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: error.message || 'An unknown error occurred.' });
    }
  };

  const fetchData = async (url, setter, headers) => {
    try {
      const res = await axios.get(url, { headers });
      setter(res.data || []);
    } catch (error) {
      console.error("Error fetching:", url, error);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCustomFields({ name: '', moduleName: '', subModuleName: '' });
  };

  // UserAddition component file
  // ... other imports and state declarations

  const handleDeleteClick = async (id) => {
    // Use SweetAlert for confirmation
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const url = `https://ucsdemo.softtrails.net/api/modules/${id}`;
        await axios.delete(url, { headers });

        Swal.fire('Deleted!', 'The module has been deleted.', 'success');
        getAllModules(); // Re-fetch data to update the table
      } catch (error) {
        console.error("Error deleting module:", error);
        Swal.fire('Error!', 'Failed to delete the module.', 'error');
      }
    }
  };

  // ... rest of the component

  return (
    <div className="w-full flex flex-col items-center px-4 min-h-screen overflow-auto">
      <div className="flex justify-center items-center w-full mt-10 ">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomizableSelect label="Application Name" id="name" value={formData.name} customValue={customFields.name} onChange={handleChange} onCustomChange={handleCustomFieldChange} options={applicationNames} placeholder="Enter new application name" required />
              <CustomizableSelect label="Module Name" id="moduleName" value={formData.moduleName} customValue={customFields.moduleName} onChange={handleChange} onCustomChange={handleCustomFieldChange} options={moduleNames} disabled={!formData.name} placeholder="Enter new module name" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomizableSelect label="Sub Module Name" id="subModuleName" value={formData.subModuleName} customValue={customFields.subModuleName} onChange={handleChange} onCustomChange={handleCustomFieldChange} options={subModuleNames} disabled={!formData.moduleName} placeholder="Enter new sub module name" />
              <div>
                <label htmlFor="tableName" className="block text-gray-700 font-medium mb-2">
                  Table Name
                </label>
                <Select
                  id="tableName"
                  options={tableOptions}
                  value={tableOptions.filter((opt) =>
                    formData.tableName.includes(opt.value)
                  )}
                  onChange={handleTableSelect}
                  isMulti
                  isSearchable
                  placeholder="Search or Select Tables..."
                  className="w-full"
                />

              </div>

              {/* ✅ Selected tables chip view */}

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="uniqueIdentifierName" className="block text-gray-700 font-medium mb-2">Unique Identifier<span className="text-red-500 ml-1">*</span></label>
                <input type="text" id="uniqueIdentifierName" value={formData.uniqueIdentifierName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter unique identifier" />
              </div>
              <div></div>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-500 px-8 py-2 rounded-lg text-white font-semibold hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
              <button
                type="button"
                className="bg-red-500 px-8 py-2 rounded-lg text-white font-semibold hover:bg-red-600 transition-colors"
                onClick={resetForm}
              >
                Reset
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* ✅ Data Table */}
      <div className="w-full max-w-4xl mt-6 overflow-auto">

        <div className='mt-4'>
          <UserDataTable
            data={tableData}
            onUpdateClick={handleUpdateClick}
            onDeleteClick={handleDeleteClick}
            filterTerm={tableFilter}
            onFilterChange={(val) => setTableFilter(val)}
          />
        </div>
      </div>

      {/* ✅ Update Modal */}
      <UpdateModal
        show={isModalOpen}
        onClose={handleCloseModal}
        data={currentItemToUpdate}
        onSave={handleSaveUpdate}
        disableUniqueIdentifier={true}
      />
    </div>
  );
};

export default UserAddition;
