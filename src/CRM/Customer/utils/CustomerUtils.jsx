// Build payload for customer API requests
export const buildCustomerPayload = (customer) => ({
  customer_name: customer.customer_name,
  phone_number: customer.phone_number,
  email_id: customer.email_id,
  address: customer.address,
  country: customer.country,
  state: customer.state,
  city: customer.city,
  pincode: customer.pincode,
  tan_number: customer.tan_number,
  gst_number: customer.gst_number,
  pan_no: customer.pan_no,
});

// GST validation: 15 characters, alphanumeric
export const validateGST = (gst) => /^[0-9A-Z]{15}$/.test(gst);

// PAN validation: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
export const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
