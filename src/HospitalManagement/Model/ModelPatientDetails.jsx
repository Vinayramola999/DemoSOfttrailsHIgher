import React from "react";
import { FaPen } from "react-icons/fa";
// Blood groups and document types used in forms
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const documentTypes = ["Aadhar", "PAN", "Driving License"];



// Modal for Patient Details (view only)
export const PatientDetailsModal = ({ selectedPatient, handleClosePatientModal, setDocUrl }) => (
	selectedPatient && (
		<div className="fixed inset-0 flex items-center justify-center animate-fadeIn bg-black bg-opacity-50 z-40 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeInUp border border-blue-100">
				<button
					className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl transition"
					onClick={handleClosePatientModal}
					aria-label="Close"
				>
					&times;
				</button>
				<div className="flex items-center gap-4 mb-6">
					<div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold text-blue-700 shadow">
						{selectedPatient.patientName?.split(" ").map(n => n[0]).join("").toUpperCase()}
					</div>
					<div>
						<h2 className="text-2xl font-bold text-blue-700 mb-1">{selectedPatient.patientName}</h2>
						<div className="text-gray-500 text-sm">{selectedPatient.email}</div>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[15px]">
					<div>
						<span className="font-semibold text-gray-700">Gender:</span> {selectedPatient.gender}
					</div>
					<div>
						<span className="font-semibold text-gray-700">DOB:</span> {selectedPatient.dateOfBirth}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Phone No.:</span> {selectedPatient.contactNumber}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Emergency No.:</span> {selectedPatient.emergencyNumber}
					</div>
					<div>
						<span className="font-semibold text-gray-700">City:</span> {selectedPatient.city}
					</div>
					<div>
						<span className="font-semibold text-gray-700">State:</span> {selectedPatient.state}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Pin Code:</span> {selectedPatient.pincode}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Blood Group:</span> {selectedPatient.patientBloodGroup}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Country:</span> {selectedPatient.country}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Address:</span> {selectedPatient.address}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Identity Doc Type:</span> {selectedPatient.identityDocType}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Identity Doc No.:</span> {selectedPatient.identityDocNumber}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Patient ID:</span> {selectedPatient.patientId}
					</div>
					<div className="col-span-2">
						<span className="font-semibold text-gray-700">Identity Doc :</span>{" "}
						{selectedPatient.identityDocLink ? (
							<button
								className="text-blue-600 underline hover:text-blue-800"
								onClick={() => setDocUrl(selectedPatient.identityDocLink)}
								type="button"
							>
								preview Document
							</button>
						) : (
							"N/A"
						)}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Identity Doc ID:</span> {selectedPatient.identityDocId}
					</div>
				</div>
			</div>
		</div>
	)
);

// Modal for editing patient details
export const EditPatientModal = ({ editPatient, handleCloseEditModal, isEditMode, setIsEditMode, editForm, touched, editErrors, handleEditChange, fileInputRef, documentUploading, handleDocumentUpload, documentUploadError, documentUploadSuccess, insuranceFileInputRef, insuranceDocUploading, handleInsuranceDocumentUpload, insuranceDocUploadError, insuranceDocUploadSuccess, handleEditSave, loading, successMsg, pincodeLoading, handleEditInsuranceChange }) => (
	editPatient && (
		<div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
			<div
				className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative border border-blue-200 animate-fadeIn"
				style={{ maxHeight: "90vh", overflowY: "auto" }}
			>
				<div className="sticky top-0 z-10 bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-6 py-4 rounded-t-2xl shadow">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-white/20">
								<FaPen className="text-white" />
							</span>
							<h2 className="text-xl sm:text-2xl font-semibold">Edit Patient Registration & Insurance</h2>
						</div>
						<div className="flex items-center gap-2">
							{!isEditMode ? (
								<button
									type="button"
									className="bg-white text-blue-700 font-medium px-4 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition"
									onClick={() => setIsEditMode(true)}
								>
									Edit
								</button>
							) : null}
							<button
								type="button"
								className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition text-white text-xl"
								onClick={handleCloseEditModal}
								aria-label="Close"
							>
								&times;
							</button>
						</div>
					</div>
				</div>
				<form onSubmit={handleEditSave} className="px-6 pb-6 pt-4 space-y-6" autoComplete="off">
					<div className="rounded-xl border border-blue-200 bg-gradient-to-b from-white to-blue-50 shadow-sm">
						<div className="px-4 py-3 border-b border-blue-200 rounded-t-xl">
							<h3 className="text-base sm:text-lg font-semibold text-blue-800">Patient Registration</h3>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-4">
							{/* Patient Name */}
							<div className="flex flex-col">
						<label className="font-medium mb-1">Patient Name </label>
						<input
							name="patientName"
							value={editForm.patientName || ""}
							onChange={handleEditChange}
							className={`border rounded px-2 py-1 ${touched.patientName && editErrors.patientName ? "border-red-400" : ""}`}
							placeholder="Patient Name"
							readOnly={!isEditMode}
						/>
						{touched.patientName && editErrors.patientName && <span className="text-red-500 text-xs">{editErrors.patientName}</span>}
					</div>
					<div className="flex flex-col">
						<label className="font-medium mb-1">Email </label>
						<input
							name="email"
							value={editForm.email || ""}
							onChange={handleEditChange}
							className={`border rounded px-2 py-1 ${touched.email && editErrors.email ? "border-red-400" : ""}`}
							placeholder="Email"
							readOnly={!isEditMode}
						/>
						{touched.email && editErrors.email && <span className="text-red-500 text-xs">{editErrors.email}</span>}
					</div>
					<div className="flex flex-col">
						<label className="font-medium mb-1">Gender </label>
						<select
							name="gender"
							value={editForm.gender || ""}
							onChange={handleEditChange}
							className={`border rounded px-2 py-1 ${touched.gender && editErrors.gender ? "border-red-400" : ""}`}
							disabled={!isEditMode}
						>
							<option value="">Select Gender</option>
							<option value="Male">Male</option>
							<option value="Female">Female</option>
							<option value="Other">Other</option>
						</select>
						{touched.gender && editErrors.gender && <span className="text-red-500 text-xs">{editErrors.gender}</span>}
					</div>
					<div className="flex flex-col">
						<label className="font-medium mb-1">Date of Birth </label>
						<input
							name="dateOfBirth"
							type="date"
							value={editForm.dateOfBirth || ""}
							onChange={handleEditChange}
							className={`border rounded px-2 py-1 ${touched.dateOfBirth && editErrors.dateOfBirth ? "border-red-400" : ""}`}
							placeholder="Date of Birth"
							readOnly={!isEditMode}
						/>
						{touched.dateOfBirth && editErrors.dateOfBirth && <span className="text-red-500 text-xs">{editErrors.dateOfBirth}</span>}
					</div>
					<div className="flex flex-col">
						<label className="font-medium mb-1">Address </label>
						<input
							name="address"
							value={editForm.address || ""}
							onChange={handleEditChange}
							className={`border rounded px-2 py-1 ${touched.address && editErrors.address ? "border-red-400" : ""}`}
							placeholder="Address"
							readOnly={!isEditMode}
						/>
						{touched.address && editErrors.address && <span className="text-red-500 text-xs">{editErrors.address}</span>}
					</div>
					<div className="flex flex-col">
						<label className="font-medium mb-1">City </label>
						<input
							name="city"
							value={editForm.city || ""}
							onChange={handleEditChange}
							className={`border rounded px-2 py-1 ${touched.city && editErrors.city ? "border-red-400" : ""}`}
							placeholder="City"
							readOnly={!isEditMode}
						/>
						{touched.city && editErrors.city && <span className="text-red-500 text-xs">{editErrors.city}</span>}
					</div>
					<div className="flex flex-col">
						<label className="font-medium mb-1">State </label>
						<input
							name="state"
							value={editForm.state || ""}
							onChange={handleEditChange}
							className={`border rounded px-2 py-1 ${touched.state && editErrors.state ? "border-red-400" : ""}`}
							placeholder="State"
							readOnly={!isEditMode}
						/>
						{touched.state && editErrors.state && <span className="text-red-500 text-xs">{editErrors.state}</span>}
					</div>
					<div className="flex flex-col">
						<label className="font-medium mb-1">Pin Code </label>
						<div className="flex items-center gap-2">
							<input
								name="pincode"
								value={editForm.pincode || ""}
								onChange={handleEditChange}
								className={`border rounded px-2 py-1 w-full ${touched.pincode && editErrors.pincode ? "border-red-400" : ""}`}
								placeholder="Pin Code"
								maxLength={6}
								readOnly={!isEditMode}
							/>
							{pincodeLoading && (
								<svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
								</svg>
							)}
						</div>
						{touched.pincode && editErrors.pincode && <span className="text-red-500 text-xs">{editErrors.pincode}</span>}
					</div>
					<div className="flex flex-col">
						<label className="font-medium mb-1">Country </label>
						<input
							name="country"
							value={editForm.country || ""}
							onChange={handleEditChange}
							className={`border rounded px-2 py-1 ${touched.country && editErrors.country ? "border-red-400" : ""}`}
							placeholder="Country"
							readOnly
						/>
						{touched.country && editErrors.country && <span className="text-red-500 text-xs">{editErrors.country}</span>}
					</div>
					<div className="flex flex-col">
						<label className="font-medium mb-1">Blood Group </label>
						<select
							name="patientBloodGroup"
							value={editForm.patientBloodGroup || ""}
							onChange={handleEditChange}
							className={`border rounded px-2 py-1 ${touched.patientBloodGroup && editErrors.patientBloodGroup ? "border-red-400" : ""}`}
							disabled={!isEditMode}
						>
							<option value="">Select Blood Group</option>
							{bloodGroups.map((bg) => (
								<option key={bg} value={bg}>{bg}</option>
							))}
						</select>
						{touched.patientBloodGroup && editErrors.patientBloodGroup && <span className="text-red-500 text-xs">{editErrors.patientBloodGroup}</span>}
					</div>
					<div className="flex flex-col">
						<label className="font-medium mb-1">Identity Document Type</label>
						<select
							name="identityDocType"
							value={editForm.identityDocType || ""}
							onChange={handleEditChange}
							className={`border rounded px-2 py-1 ${touched.identityDocType && editErrors.identityDocType ? "border-red-400" : ""}`}
							disabled={!isEditMode}
						>
							<option value="">Select Identity Document Type</option>
							{documentTypes.map((dt) => (
								<option key={dt} value={dt}>{dt}</option>
							))}
						</select>
						{touched.identityDocType && editErrors.identityDocType && <span className="text-red-500 text-xs">{editErrors.identityDocType}</span>}
					</div>
					<div className="flex flex-col">
						<label className="font-medium mb-1">Identity Document Number</label>
						<input
							name="identityDocNumber"
							value={editForm.identityDocNumber || ""}
							onChange={handleEditChange}
							className={`border rounded px-2 py-1 ${touched.identityDocNumber && editErrors.identityDocNumber ? "border-red-400" : ""}`}
							placeholder="Identity Document Number"
							readOnly={!isEditMode}
						/>
						{touched.identityDocNumber && editErrors.identityDocNumber && <span className="text-red-500 text-xs">{editErrors.identityDocNumber}</span>}
					</div>
					<div className="flex flex-col col-span-2">
						<label className="font-medium mb-1">Identity Document Upload</label>
						<div className="flex items-center gap-3">
							<input
								type="file"
								accept=".jpg,.jpeg,.png,.pdf"
								ref={fileInputRef}
								style={{ display: "none" }}
								onChange={handleDocumentUpload}
								disabled={!isEditMode}
							/>
							<button
								type="button"
								className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 transition"
								onClick={() => isEditMode && fileInputRef.current && fileInputRef.current.click()}
								disabled={documentUploading || !isEditMode}
							>
								{documentUploading ? "Uploading..." : "Upload Document"}
							</button>
							{editForm.identityDocLink && (
								<a
									href={editForm.identityDocLink}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-700 underline ml-2 hover:text-blue-900"
								>
									preview Document
								</a>
							)}
						</div>
						{documentUploadError && <span className="text-red-500 text-xs">{documentUploadError}</span>}
						{documentUploadSuccess && <span className="text-green-600 text-xs">{documentUploadSuccess}</span>}
						</div>
						</div>
					</div>
					{/* Insurance Edit Section */}
					{editForm.insurances && editForm.insurances.length > 0 && (
						<div className="rounded-xl border border-amber-200 bg-gradient-to-b from-white to-amber-50 shadow-sm">
							<div className="px-4 py-3 border-b border-amber-200 rounded-t-xl">
								<h3 className="text-base sm:text-lg font-semibold text-amber-800">Insurance Information</h3>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-4">
								<div className="flex flex-col">
								<label className="font-medium mb-1">Insurance Company </label>
								<input
									name="insuranceCompany"
									value={editForm.insurances[0].insuranceCompany || ""}
									onChange={handleEditInsuranceChange}
									className={`border rounded px-2 py-1 ${touched.insuranceCompany && editErrors.insuranceCompany ? "border-red-400" : ""}`}
									placeholder="Insurance Company"
									readOnly={!isEditMode}
								/>
								{touched.insuranceCompany && editErrors.insuranceCompany && <span className="text-red-500 text-xs">{editErrors.insuranceCompany}</span>}
							</div>
							<div className="flex flex-col">
								<label className="font-medium mb-1">Insurance ID </label>
								<input
									name="insuranceId"
									value={editForm.insurances[0].insuranceId || ""}
									onChange={handleEditInsuranceChange}
									className={`border rounded px-2 py-1 ${touched.insuranceId && editErrors.insuranceId ? "border-red-400" : ""}`}
									placeholder="Insurance ID"
									readOnly={!isEditMode}
								/>
								{touched.insuranceId && editErrors.insuranceId && <span className="text-red-500 text-xs">{editErrors.insuranceId}</span>}
							</div>
							<div className="flex flex-col">
								<label className="font-medium mb-1">Insurance Contact Number</label>
								<input
									name="insuranceCompanyContact"
									value={editForm.insurances[0].insuranceCompanyContact || ""}
									onChange={handleEditInsuranceChange}
									className={`border rounded px-2 py-1 ${touched.insuranceCompanyContact && editErrors.insuranceCompanyContact ? "border-red-400" : ""}`}
									placeholder="Insurance Contact Number"
									readOnly={!isEditMode}
								/>
								{touched.insuranceCompanyContact && editErrors.insuranceCompanyContact && <span className="text-red-500 text-xs">{editErrors.insuranceCompanyContact}</span>}
							</div>
							<div className="flex flex-col">
								<label className="font-medium mb-1">Insurance Email</label>
								<input
									name="insuranceCompanyEmail"
									value={editForm.insurances[0].insuranceCompanyEmail || ""}
									onChange={handleEditInsuranceChange}
									className={`border rounded px-2 py-1 ${touched.insuranceCompanyEmail && editErrors.insuranceCompanyEmail ? "border-red-400" : ""}`}
									placeholder="Insurance Email"
									readOnly={!isEditMode}
								/>
								{touched.insuranceCompanyEmail && editErrors.insuranceCompanyEmail && <span className="text-red-500 text-xs">{editErrors.insuranceCompanyEmail}</span>}
							</div>
							<div className="flex flex-col">
								<label className="font-medium mb-1">Status </label>
								<select
									name="status"
									value={editForm.insurances[0].status || ""}
									onChange={handleEditInsuranceChange}
									className={`border rounded px-2 py-1 ${touched.status && editErrors.status ? "border-red-400" : ""}`}
									disabled={!isEditMode}
								>
									<option value="">Select Status</option>
									<option value="ACTIVE">ACTIVE</option>
									<option value="INACTIVE">INACTIVE</option>
								</select>
								{touched.status && editErrors.status && <span className="text-red-500 text-xs">{editErrors.status}</span>}
							</div>
							{/* Insurance Document Upload */}
							<div className="flex flex-col sm:col-span-2">
								<label className="font-medium mb-1">Insurance Document Upload</label>
								<div className="flex items-center gap-3">
									<input
										type="file"
										accept=".jpg,.jpeg,.png,.pdf"
										ref={insuranceFileInputRef}
										style={{ display: "none" }}
										onChange={handleInsuranceDocumentUpload}
										disabled={!isEditMode}
									/>
									<button
										type="button"
										className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 transition"
										onClick={() => isEditMode && insuranceFileInputRef.current && insuranceFileInputRef.current.click()}
										disabled={insuranceDocUploading || !isEditMode}
									>
										{insuranceDocUploading ? "Uploading..." : "Upload Document"}
									</button>
									{editForm.insurances[0].insuranceDocLink && (
										<a
											href={editForm.insurances[0].insuranceDocLink}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-700 underline ml-2 hover:text-blue-900"
										>
											View Current
										</a>
									)}
								</div>
								{insuranceDocUploadError && <span className="text-red-500 text-xs">{insuranceDocUploadError}</span>}
								{insuranceDocUploadSuccess && <span className="text-green-600 text-xs">{insuranceDocUploadSuccess}</span>}
							</div>
							</div>
						</div>
					)}
					{/* Save Button */}
					{isEditMode && (
						<div className="flex flex-col items-center mt-2">
							<button
								type="submit"
								className={`bg-blue-700 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-800 transition-all duration-150 flex items-center gap-2 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
								disabled={loading}
							>
								{loading ? (
									<svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
									</svg>
								) : null}
								Save
							</button>
							{successMsg && (
								<span className="text-green-600 font-semibold mt-2 animate-fadeIn">{successMsg}</span>
							)}
						</div>
					)}
				</form>
			</div>
		</div>
	)
);

// Modal for Insurance Details
export const InsuranceDetailsModal = ({ selectedInsurance, handleCloseInsuranceModal, setDocUrl }) => (
	selectedInsurance && (
		<div className="fixed inset-0 flex items-center justify-center animate-fadeIn bg-black bg-opacity-50 z-40 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeInUp border border-blue-100">
				<button
					className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl transition"
					onClick={handleCloseInsuranceModal}
					aria-label="Close"
				>
					&times;
				</button>
				<div className="flex items-center gap-4 mb-6">
					<div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700 shadow">
						{selectedInsurance.insuranceCompany?.split(" ").map(n => n[0]).join("").toUpperCase()}
					</div>
					<div>
						<h2 className="text-2xl font-bold text-blue-700 mb-1">{selectedInsurance.insuranceCompany}</h2>
						<div className="text-gray-500 text-sm">{selectedInsurance.insuranceCompanyEmail}</div>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[15px]">
					<div>
						<span className="font-semibold text-gray-700">Insurance ID:</span> {selectedInsurance.insuranceId}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Contact Number:</span> {selectedInsurance.insuranceCompanyContact}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Status:</span> {selectedInsurance.status}
					</div>
					<div className="col-span-2">
						<span className="font-semibold text-gray-700">Insurance Document:</span>{" "}
						{selectedInsurance.insuranceDocLink ? (
							<button
								className="text-blue-600 underline hover:text-blue-800"
								onClick={() => setDocUrl(selectedInsurance.insuranceDocLink)}
								type="button"
							>
								preview Document
							</button>
						) : (
							"N/A"
						)}
					</div>
					<div>
						<span className="font-semibold text-gray-700">Insurance Document ID:</span> {selectedInsurance.insuranceDocId}
					</div>
				</div>
			</div>
		</div>
	)
);

