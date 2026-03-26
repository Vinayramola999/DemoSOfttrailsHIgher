// Handles patient name change logic
export async function handlePatientNameChange({
	value,
	formData,
	setFormData,
	setShowAddPatientInput,
	setDocumentPreview,
	setErrors,
	fileInputRef,
	setShowInsurance,
	getPatientPhone
}) {
	if (value === "+add") {
		setFormData(prev => ({
			...prev,
			patientName: "",
			gender: "",
			email: "",
			state: "",
			dateOfBirth: "",
			address: "",
			emergencyNumber: "",
			city: "",
			pincode: "",
			country: "",
			patientBloodGroup: "",
			identityDocType: "",
			identityDocNumber: "",
			identityDocLink: "",
			identityDocId: "",
			documentFile: null,
			documentType: "",
			documentTypeOther: "",
			documentNumber: "",
			insurance: {
				insuranceCompany: "",
				insuranceId: "",
				insuranceCompanyContact: "",
				insuranceCompanyEmail: "",
				insuranceDocLink: "",
				insuranceDocId: "",
				status: "ACTIVE",
				stages: "APPLIED"
			},
		}));
		setShowAddPatientInput(true);
		setDocumentPreview(null);
		setErrors({});
		if (fileInputRef && fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	} else {
		const data = await getPatientPhone(formData.contactNumber);
		const patient = data.find(p => p.patientName === value);
		if (patient) {
			setFormData(prev => ({
				...prev,
				patientName: patient.patientName || "",
				gender: patient.gender || "",
				email: patient.email || "",
				state: patient.state || "",
				dateOfBirth: patient.dateOfBirth || "",
				address: patient.address || "",
				emergencyNumber: patient.emergencyNumber || "",
				city: patient.city || "",
				pincode: patient.pincode || "",
				country: patient.country || "",
				patientBloodGroup: patient.patientBloodGroup || "",
				documentType: patient.identityDocType || "",
				documentNumber: patient.identityDocNumber || "",
				documentFile: patient.identityDocLink
					? {
							name: "Previous Document",
							type: patient.identityDocLink.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
							url: patient.identityDocLink
						}
					: null,
				insurance: patient.insurances && patient.insurances[0]
					? {
							insuranceCompany: patient.insurances[0].insuranceCompany || "",
							insuranceId: patient.insurances[0].insuranceId || "",
							insuranceCompanyContact: patient.insurances[0].insuranceCompanyContact || "",
							insuranceCompanyEmail: patient.insurances[0].insuranceCompanyEmail || "",
							insuranceDocLink: patient.insurances[0].insuranceDocLink || "",
							insuranceDocId: patient.insurances[0].insuranceDocId || "",
							status: patient.insurances[0].status || "ACTIVE",
							stages: patient.insurances[0].stages || "APPLIED"
						}
					: {
							insuranceCompany: "",
							insuranceId: "",
							insuranceCompanyContact: "",
							insuranceCompanyEmail: "",
							insuranceDocLink: "",
							insuranceDocId: "",
							status: "ACTIVE",
							stages: "APPLIED"
						}
			}));
			if (patient.identityDocLink) {
				setDocumentPreview(patient.identityDocLink);
			} else {
				setDocumentPreview(null);
			}
			if (patient.insurances && patient.insurances[0]) {
				setShowInsurance(true);
			} else {
				setShowInsurance(false);
			}
			setShowAddPatientInput(false);
		}
	}
}

// Returns patientToSave object
export function getPatientToSave({ formData, identityDocLink, identityDocId, showInsurance }) {
	return {
		patientName: formData.patientName,
		gender: formData.gender,
		email: formData.email,
		state: formData.state,
		dateOfBirth: formData.dateOfBirth,
		contactNumber: formData.contactNumber,
		address: formData.address,
		emergencyNumber: formData.emergencyNumber,
		city: formData.city,
		pincode: formData.pincode,
		patientBloodGroup: formData.patientBloodGroup,
		country: formData.country,
		identityDocType: formData.documentType === "Other Document"
			? formData.documentTypeOther
			: formData.documentType,
		identityDocNumber: formData.documentNumber,
		identityDocLink,
		identityDocId,
		insurances: showInsurance && formData.insurance.insuranceCompany
			? [
					{
						insuranceCompany: formData.insurance.insuranceCompany,
						insuranceId: formData.insurance.insuranceId,
						insuranceCompanyContact: formData.insurance.insuranceCompanyContact,
						insuranceCompanyEmail: formData.insurance.insuranceCompanyEmail,
						insuranceDocLink: formData.insurance.insuranceDocLink || "",
						insuranceDocId: formData.insurance.insuranceDocId || "",
						status: "ACTIVE",
						stages: "APPLIED"
					}
				]
			: [],
	};
}
// Clears autofilled patient registration data
export function clearAutoFilledData(formData) {
	return {
		patientName: "",
		gender: "",
		email: "",
		state: "",
		dateOfBirth: "",
		contactNumber: formData.contactNumber,
		address: "",
		emergencyNumber: "",
		city: "",
		pincode: "",
		country: "",
		patientBloodGroup: "",
		identityDocType: "",
		identityDocNumber: "",
		identityDocLink: "",
		identityDocId: "",
		documentFile: null,
		documentType: "",
		documentTypeOther: "",
		documentNumber: "",
		insurance: {
			insuranceCompany: "",
			insuranceId: "",
			insuranceCompanyContact: "",
			insuranceCompanyEmail: "",
			insuranceDocLink: "",
			insuranceDocId: "",
			status: "ACTIVE",
			stages: "APPLIED"
		},
	};
}
// ModelPatientRegistration.jsx
// Contains validation logic for patient registration

export function validatePatientRegistration(formData) {
	const newErrors = {};
	if (!formData.patientName) {
		newErrors.patientName = "Patient name is required";
	}
	if (!formData.gender) {
		newErrors.gender = "Gender is required";
	}
	if (!formData.email) {
		newErrors.email = "Email is required";
		} else if (
			!/^(?!.*\.\.)(?!.*\.$)[^\W][\w.-]{0,29}@[A-Za-z0-9][A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)
		|| formData.email.length > 320
		|| !formData.email.includes("@")
		|| formData.email.startsWith(".")
		|| formData.email.endsWith(".")
		|| formData.email.split("@")[0].length > 64
		|| formData.email.split("@")[1]?.length > 255
	) {
		newErrors.email = "Please enter a valid email address";
	}
	if (!formData.state) {
		newErrors.state = "State is required";
	}
	if (!formData.dateOfBirth) {
		newErrors.dateOfBirth = "Date of birth is required";
	}
	if (!formData.contactNumber) {
		newErrors.contactNumber = "Phone number is required";
	} else if (!/^[1-9][0-9]{9}$/.test(formData.contactNumber)) {
		newErrors.contactNumber = "Phone number must be 10 digits and not start with 0";
	}
	if (!formData.address) {
		newErrors.address = "Address is required";
	}
	if (!formData.emergencyNumber) {
		newErrors.emergencyNumber = "Emergency contact is required";
	} else if (!/^[1-9][0-9]{9}$/.test(formData.emergencyNumber)) {
		newErrors.emergencyNumber = "Emergency contact must be 10 digits and not start with 0";
	}
	if (!formData.city) {
		newErrors.city = "City is required";
	}
	if (!formData.pincode) {
		newErrors.pincode = "Pin code is required";
	} else if (!/^\d{6}$/.test(formData.pincode)) {
		newErrors.pincode = "Pin code must be 6 digits";
	}
	if (!formData.patientBloodGroup) {
		newErrors.patientBloodGroup = "Blood group is required";
	}
	if (!formData.documentType) {
		newErrors.documentType = "Document type is required";
	}
	if (!formData.documentNumber) {
		newErrors.documentNumber = "Document number is required";
	}
	if (!formData.documentFile) {
		newErrors.documentFile = "Document upload is required";
	}
	return newErrors;
}
