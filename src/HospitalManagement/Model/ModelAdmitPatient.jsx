// Model definitions for Admitpatient
export const admitPatientFormModel = {
	patientId: "",
	patientName: "",
	contactNumber: "",
	email: "",
	dob: "",
	emergencyContact: "",
	gender: "",
	pincode: "",
	insurance: true,
	insuranceCompanyName: "",
	insuranceId: "",
	insuranceCompanyContact: "",
	insuranceCompanyEmail: "",
	insuranceCompany: "",
	documentType: "",
	documentNumber: ""
};

export const admitPatientSearchByModel = "id";
export const admitPatientIsAutoFilledModel = false;
export const admitPatientLoadingModel = false;
export const admitPatientErrorModel = "";
export const admitPatientSuccessModel = "";
export const admitPatientShowCustomModalModel = false;
export const admitPatientShowAdmitConfirmModel = false;

// Admit Confirm Modal Component
export const AdmitConfirmModal = ({ onBack, onConfirm }) => (
	<div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-30">
		<div className="bg-white rounded-2xl shadow-xl px-10 py-8 w-full max-w-md relative border border-gray-200 flex flex-col items-center">
			<div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
				<span className="text-white text-4xl font-bold">?</span>
			</div>
			<h2 className="text-2xl font-bold mb-2 text-blue-700 text-center">Admit Patient?</h2>
			<p className="mb-6 text-gray-700 text-center">Are you sure you want to admit patient?</p>
			<div className="flex gap-4 w-full">
				<button
					className="border border-black text-black font-semibold rounded-lg text-base bg-white hover:bg-gray-100 px-8 py-2 w-1/2"
					onClick={onBack}
				>
					Back
				</button>
				<button
					className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-base px-8 py-2 w-1/2"
					onClick={onConfirm}
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
);

// Custom Modal Component
export const CustomModal = ({ onClose }) => (
	<div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-30">
		<div className="bg-white rounded-2xl shadow-xl px-10 py-8 w-full max-w-md relative border border-gray-200 flex flex-col items-center">
			<div className="bg-red-600 rounded-full w-20 h-20 flex items-center justify-center mb-4">
				<span className="text-white text-4xl font-bold">!</span>
			</div>
			<h2 className="text-2xl font-bold mb-2 text-red-600 text-center">Notice</h2>
			<p className="mb-6 text-gray-700 text-center">Patient Already Admitted</p>
			<button
				className="bg-red-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-10 py-2 w-full"
				onClick={onClose}
			>
				OK
			</button>
		</div>
	</div>
);
