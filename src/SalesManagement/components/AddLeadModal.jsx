import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import Select from "react-select";
import './AddLeadModal.css';
const baseUrl = process.env.REACT_APP_URL_sales || '';

const AddLeadModal = ({ onClose, onSubmit, customers, leadTypeOptions, kamUsers }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [errors, setErrors] = useState({});
  // Initialize state with all required fields including remark
  const [formData, setFormData] = useState({
    customerId: '',
    lead: '',
    subCategory: '',
    date: new Date().toISOString().split('T')[0],
    leadCreationDate: '',
    source: 'Sales', // Pre-filled with Sales
    kam: '',
    remark: '',  // Added remark field
    renew_day: '', // Will be populated from API
    active_days: ''  // Will be populated from API
  });

  // Fetch subcategories when lead changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formData.lead) {
        setSubCategories([]);
        return;
      }

      setIsLoadingSubCategories(true);
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${baseUrl}/salesmanagement/leads/subcategories`, {
          params: { service: formData.lead },
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          }
        });
        
        if (response.data.success && Array.isArray(response.data.subcategories)) {
          // Filter out null values and format for react-select, including renew_day and active_duration
          const validSubCategories = response.data.subcategories
            .filter(cat => cat != null)
            .map(cat => ({
              value: cat.sub_category,
              label: cat.sub_category,
              renew_day: cat.renew_day,
              active_duration: cat.active_duration
            }));
          setSubCategories(validSubCategories);

          // Clear subCategory if current value isn't in new options
          if (formData.subCategory && !validSubCategories.find(c => c.value === formData.subCategory)) {
            setFormData(prev => ({ ...prev, subCategory: '', renew_day: '', active_days: '' }));
          }
        } else {
          setSubCategories([]);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setSubCategories([]);
      } finally {
        setIsLoadingSubCategories(false);
      }
    };

    fetchSubCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.lead]);

  const handleSubCategoryChange = (selectedOption) => {
    if (selectedOption) {
      // Extract renew_day and active_duration from selected subcategory
      setFormData(prev => ({
        ...prev,
        subCategory: selectedOption.value,
        renew_day: selectedOption.renew_day?.toString() || '',
        active_days: selectedOption.active_duration?.toString() || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subCategory: '',
        renew_day: '',
        active_days: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Customer ID is required';
    }
    if (!formData.lead) {
      newErrors.lead = 'Lead Type is required';
    }
    if (!formData.subCategory) {
      newErrors.subCategory = 'Sub Category is required';
    }
    if (!formData.kam) {
      newErrors.kam = 'KAM is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
        onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg" style={{ width: '500px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div className="flex justify-between items-center px-5 py-3 border-b">
          <h2 className="text-lg font-semibold">Add Lead</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Customer ID */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Customer ID
            </label>
            <Select
              name="customerId"
              value={customers
                .map(customer => ({
                  value: customer.customer_uid || customer.customer_id,
                  label: `${customer.customer_uid || customer.customer_id} (${customer.customer_name})`
                }))
                .find(option => String(option.value) === String(formData.customerId)) || null}
              onChange={(option) => handleChange({
                target: {
                  name: "customerId",
                  value: option ? option.value : ""
                }
              })}
              options={customers.map(customer => ({
                value: customer.customer_uid || customer.customer_id,
                label: `${customer.customer_uid || customer.customer_id} (${customer.customer_name})`
              }))}
              className={`basic-single ${errors.customerId ? "border border-red-500 rounded-md" : ""}`}
              classNamePrefix="select"
              isClearable
              isSearchable
              placeholder="Select Customer ID"
            />
            {errors.customerId && (
              <span className="text-red-500 text-sm">{errors.customerId}</span>
            )}
          </div>

          {/* Lead */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Lead
            </label>
            <Select
              name="lead"
              value={leadTypeOptions
                .map(item => ({
                  value: item.lead_category,
                  label: item.lead_category
                }))
                .find(option => String(option.value) === String(formData.lead)) || null}
              onChange={(option) => handleChange({
                target: {
                  name: "lead",
                  value: option ? option.value : ""
                }
              })}
              options={leadTypeOptions.map(item => ({
                value: item.lead_category,
                label: item.lead_category
              }))}
              className={`basic-single ${errors.lead ? "border border-red-500 rounded-md" : ""}`}
              classNamePrefix="select"
              isClearable
              isSearchable
              placeholder="Select Lead Category"
            />
            {errors.lead && (
              <span className="text-red-500 text-sm">{errors.lead}</span>
            )}
          </div>

          {/* Sub Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sub Category
            </label>
            <Select
              name="subCategory"
              value={subCategories.find(cat => cat.value === formData.subCategory) || null}
              onChange={handleSubCategoryChange}
              options={subCategories}
              isLoading={isLoadingSubCategories}
              isClearable
              placeholder="Select Sub Category"
              classNamePrefix="react-select"
              className={`w-full ${errors.subCategory ? "border-red-500" : ""}`}
              isDisabled={!formData.lead}
              required
              formatOptionLabel={(option) => option.label}
            />
            {errors.subCategory && (
              <span className="text-red-500 text-sm">{errors.subCategory}</span>
            )}
            {/* Display selected subcategory name and fetched values */}
            {formData.subCategory && (
              <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                <p><strong>Selected:</strong> {formData.subCategory}</p>
                {formData.renew_day && <p><strong>Renew Day:</strong> {formData.renew_day}</p>}
                {formData.active_days && <p><strong>Active Days:</strong> {formData.active_days}</p>}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-50 text-gray-500 cursor-not-allowed"
              disabled
              required
            />
          </div>

          {/* Lead Creation Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Lead Date
            </label>
            <input
              type="date"
              name="leadCreationDate"
              value={formData.leadCreationDate}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Source */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Source
            </label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="Enter source"
              className="w-full p-2 border rounded bg-gray-50 text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>

          {/* KAM */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              KAM (Key Account Manager)
            </label>
            <Select
              name="kam"
              value={kamUsers
                .map(user => ({
                  value: user.user_id,
                  label: `${user.first_name} ${user.last_name}`
                }))
                .find(option => String(option.value) === String(formData.kam)) || null}
              onChange={(option) => handleChange({
                target: {
                  name: "kam",
                  value: option ? option.value : ""
                }
              })}
              options={kamUsers.map(user => ({
                value: user.user_id,
                label: `${user.first_name} ${user.last_name}`
              }))}
              className={`basic-single ${errors.kam ? "border border-red-500 rounded-md" : ""}`}
              classNamePrefix="select"
              isClearable
              isSearchable
              placeholder="Select KAM"
            />
            {errors.kam && (
              <span className="text-red-500 text-sm">{errors.kam}</span>
            )}
          </div>

          {/* Remark */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Remark
            </label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              placeholder="Enter Remark"
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          </form>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="flex items-center justify-between px-5 py-4 border-t bg-white gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
          >
            Add Lead
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;