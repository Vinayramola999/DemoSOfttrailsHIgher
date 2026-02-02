// src/CRM/hooks/useCustomers.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  fetchCustomers,
  addCustomer,
  editCustomer,
  deleteCustomer,
} from "../store/customersSlice";

export const useCustomers = () => {
  const dispatch = useDispatch();
  const { data: customers, loading, error } = useSelector(
    (state) => state.customers
  );

  // Fetch customers on mount
  useEffect(() => {
    if (customers.length === 0) {
      dispatch(fetchCustomers());
    }
  }, [dispatch, customers.length]);

  // Add new customer
  const createCustomer = async (payload) => {
    await dispatch(addCustomer(payload));
  };

  // Update customer
  const updateCustomer = async (id, payload) => {
    await dispatch(editCustomer({ id, payload }));
  };

  // Delete customer
  const removeCustomer = async (id) => {
    await dispatch(deleteCustomer(id));
  };

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    removeCustomer,
    refresh: () => dispatch(fetchCustomers()), // manual refresh
  };
};
