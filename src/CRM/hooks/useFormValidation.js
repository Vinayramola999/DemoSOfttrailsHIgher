// hooks/useFormValidation.js
import { useState, useCallback } from 'react';
import { VALIDATION_REGEX, FIELD_LENGTHS, ERROR_MESSAGES } from '../Customer/utils/constants';

const useFormValidation = () => {
  const [errors, setErrors] = useState({
    pan: '',
    gst: '',
    email: '',
    phone: '',
    general: ''
  });

  const validateField = useCallback((field, value) => {
    let error = '';
    
    switch (field) {
      case 'gst':
        // Only validate if GST is provided (not empty)
        if (value && value.trim() && !VALIDATION_REGEX.GST.test(value.trim())) {
          error = ERROR_MESSAGES.INVALID_GST;
        }
        break;
      case 'pan':
        // Only validate if PAN is provided (not empty)
        if (value && value.trim() && !VALIDATION_REGEX.PAN.test(value.trim())) {
          error = ERROR_MESSAGES.INVALID_PAN;
        }
        break;
      case 'email':
        if (value && value.trim() && !VALIDATION_REGEX.EMAIL.test(value.trim())) {
          error = ERROR_MESSAGES.INVALID_EMAIL;
        }
        break;
      case 'phone':
        if (value && value.trim()) {
          // Check if it contains only digits
          if (!VALIDATION_REGEX.PHONE_DIGITS.test(value)) {
            error = 'Phone number should contain only digits';
          } else if (value.length !== FIELD_LENGTHS.PHONE) {
            error = ERROR_MESSAGES.INVALID_PHONE_LENGTH || ERROR_MESSAGES.INVALID_PHONE;
          }
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, []);

  const validateForm = useCallback((formData) => {
    // MAJOR FIX: Create a fresh errors object to avoid stale state issues
    let tempErrors = {
      pan: '',
      gst: '',
      email: '',
      phone: '',
      general: ''
    };

    let isValid = true;

    // Check required field: customer name
    if (!formData.customer_name || !formData.customer_name.trim()) {
      tempErrors.general = 'Customer name is required';
      isValid = false;
    }

    // Check that either phone OR email is provided (not both required)
    const hasPhone = formData.phone_number && formData.phone_number.trim();
    const hasEmail = formData.email_id && formData.email_id.trim();

    if (!hasPhone && !hasEmail) {
      tempErrors.general = 'Either phone number or email is required';
      isValid = false;
    }

    // Validate email format if provided
    if (hasEmail && !VALIDATION_REGEX.EMAIL.test(formData.email_id.trim())) {
      tempErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
      isValid = false;
    }

    // Validate phone format and length if provided
    if (hasPhone) {
      const phone = formData.phone_number.trim();
      if (!VALIDATION_REGEX.PHONE_DIGITS.test(phone)) {
        tempErrors.phone = 'Phone number should contain only digits';
        isValid = false;
      } else if (phone.length !== FIELD_LENGTHS.PHONE) {
        tempErrors.phone = ERROR_MESSAGES.INVALID_PHONE_LENGTH || ERROR_MESSAGES.INVALID_PHONE;
        isValid = false;
      }
    }

    // Validate optional fields (GST and PAN) only if they are provided
    if (formData.gst_number && formData.gst_number.trim()) {
      if (!VALIDATION_REGEX.GST.test(formData.gst_number.trim())) {
        tempErrors.gst = ERROR_MESSAGES.INVALID_GST;
        isValid = false;
      }
    }

    if (formData.pan_no && formData.pan_no.trim()) {
      if (!VALIDATION_REGEX.PAN.test(formData.pan_no.trim())) {
        tempErrors.pan = ERROR_MESSAGES.INVALID_PAN;
        isValid = false;
      }
    }

    // Update errors state with all validation results
    setErrors(tempErrors);
    
    // IMPORTANT: Add debugging to see what's happening
    console.log('Form validation result:', {
      formData: formData,
      isValid: isValid,
      errors: tempErrors
    });

    return isValid;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({
      pan: '',
      gst: '',
      email: '',
      phone: '',
      general: ''
    });
  }, []);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    setFieldError
  };
};

export default useFormValidation;