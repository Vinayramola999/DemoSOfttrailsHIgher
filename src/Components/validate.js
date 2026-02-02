const validateFirstName = (first_name) => {
    const nameRegex = /^[a-zA-Z]+$/;
    return nameRegex.test(first_name) ? null : 'Only alphabets allowed';
};
const validateLastName = (last_name) => {
    const nameRegex = /^[a-zA-Z]+$/;
    return nameRegex.test(last_name) ? null : 'Only alphabets allowed';
};
// const validateEmail = (email) => {
//     // const emailRegex = /^[^@\s]+@[a-z]+(?:\.[a-z]{2,3})+(?:,\s*[^@\s]+@[a-z]+(?:\.[a-z]{2,3})+)*$/;
//     const emailRegex = /^[a-z]+(?:\.[a-z]{2,3})+(?:,\s*[a-z]+(?:\.[a-z]{2,3})+)*$/;
//     return emailRegex.test(email) ? null : 'Please enter a valid email address.';
// }
const validateEmail = (email) => {
  const emailRegex = /^[a-z]+(?:\.[a-z]{2,3})+(?:,\s*[a-z]+(?:\.[a-z]{2,3})+)*$/;
  return emailRegex.test(email)
    ? null
    : "Please enter a valid email/domain.";
};

const validatePhone = (phone_no) => {
    const phoneRegex = /^\d{10}$/;
    const isNotAllSameDigits = !/(\d)\1{9}/.test(phone_no);
    return phoneRegex.test(phone_no) && isNotAllSameDigits ? null : 'Please enter a valid mobile number.';
};
const validateRole = (role) => {
    const nameRegex = /^[a-zA-Z]+$/;
    return nameRegex.test(role) ? null : 'Only alphabets allowed';
};
const validatePassword = (password) => {
    if (password.length < 8 || password.length > 40) {
        return 'Password must be between 8 and 40 characters long';
    }

    if (!/[a-zA-Z]/.test(password)) {
        return 'Password must contain at least one alphabet';
    }

    if (!/\d/.test(password)) {
        return 'Password must contain at least one digit';
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return 'Password must contain at least one special character';
    }
    return null;
};

const validateConfirmPassword = (password, confirm_password) => {
    return password === confirm_password ? null : 'Passwords do not match';
};


/***********PROFILE*********** */
const validateCustomerName = (customer_name) => {
    const nameRegex = /^[a-zA-Z]+$/;
    return nameRegex.test(customer_name) ? null : 'Only alphabets allowed';
};

const validateAddress = (address) => {
    const nameRegex = /^[a-zA-Z]+$/;
    return nameRegex.test(address) ? null : 'Only alphabets allowed';
};

const validateCountry = (country) => {
    const nameRegex = /^[a-zA-Z]+$/;
    return nameRegex.test(country) ? null : 'Only alphabets allowed';
};
export {
    validateFirstName,
    validateLastName,
    validateEmail,
    validatePhone,
    validatePassword,
    validateConfirmPassword,
    validateRole,
    validateCustomerName,
    validateAddress,
    validateCountry,
};