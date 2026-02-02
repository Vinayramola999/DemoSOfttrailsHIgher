// hooks/useAccessControl.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_PERMISSIONS } from '../Customer/utils/constants';
import API_GLOBAL_BASE_URL from '../config/api';

const useAccessControl = () => {
  const [permissions, setPermissions] = useState({
    createCustomer: false,
    createContact: false,
    updateCustomer: false,
    deleteCustomer: false,
    updateContact: false,
    deleteContact: false,
    flagCustomer: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAccess = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      if (!userId || !token) {
        console.warn('No userId or token found in session storage');
        return;
      }

      const response = await axios.get(`${API_GLOBAL_BASE_URL}/access/access/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userAccess = response.data;

      // Map API permissions to local state
      const accessMap = {
        createCustomer: API_PERMISSIONS.CREATE_CUSTOMER,
        createContact: API_PERMISSIONS.CREATE_CONTACT,
        updateCustomer: API_PERMISSIONS.UPDATE_CUSTOMER,
        deleteCustomer: API_PERMISSIONS.DELETE_CUSTOMER,
        updateContact: API_PERMISSIONS.UPDATE_CONTACT,
        deleteContact: API_PERMISSIONS.DELETE_CONTACT,
        flagCustomer: API_PERMISSIONS.FLAG_CUSTOMER
      };

      const newPermissions = Object.keys(accessMap).reduce((acc, key) => {
        acc[key] = userAccess.some(access => access.api_name === accessMap[key]);
        return acc;
      }, {});

      setPermissions(newPermissions);

    } catch (err) {
      console.error("Error fetching access rights:", err);
      setError(err.message || 'Failed to fetch access rights');

      // Reset to no permissions on error
      setPermissions({
        createCustomer: false,
        createContact: false,
        updateCustomer: false,
        deleteCustomer: false,
        updateContact: false,
        deleteContact: false,
        flagCustomer: false
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const hasPermission = useCallback((permissionKey) => {
    return permissions[permissionKey] || false;
  }, [permissions]);

  const hasAnyPermission = useCallback((permissionKeys) => {
    return permissionKeys.some(key => permissions[key]);
  }, [permissions]);

  const hasAllPermissions = useCallback((permissionKeys) => {
    return permissionKeys.every(key => permissions[key]);
  }, [permissions]);

  return {
    permissions,
    loading,
    error,
    checkAccess,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
};

export default useAccessControl;