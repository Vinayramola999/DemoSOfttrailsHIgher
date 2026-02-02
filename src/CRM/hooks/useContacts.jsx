// src/CRM/hooks/useContacts.js
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchContacts,
  addContact,
  editContact,
  deleteContact,
  resetContacts,
} from "../store/contactsSlice";

export const useContacts = (customerId) => {
  const dispatch = useDispatch();
  const { data: contacts, loading, error } = useSelector(
    (state) => state.contacts
  );

  // Fetch contacts for a customer
  const loadContacts = useCallback(() => {
    if (customerId) {
      dispatch(fetchContacts(customerId));
    }
  }, [dispatch, customerId]);

  const createContact = (payload) => {
    dispatch(addContact({ customerId, payload }));
  };

  const updateContact = (contactId, payload) => {
    dispatch(editContact({ contactId, payload }));
  };

  const removeContact = (contactId) => {
    dispatch(deleteContact(contactId));
  };

  const clearContacts = () => {
    dispatch(resetContacts());
  };

  return {
    contacts,
    loading,
    error,
    loadContacts,
    createContact,
    updateContact,
    removeContact,
    clearContacts,
  };
};
