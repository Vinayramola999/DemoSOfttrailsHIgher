import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdmissionsWithAllocations, previewBill } from "../api/Service";
import GenerateBill from "./GenerateBill";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const Billing = () => {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [admissions, setAdmissions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showGenerateBill, setShowGenerateBill] = useState(false);
	const [previewLoading, setPreviewLoading] = useState(false);
	const [previewError, setPreviewError] = useState("");
	const [activeTab,] = useState("billing"); // Initialize activeTab
	const navigate = useNavigate();

	useEffect(() => {
		setLoading(true);
		getAdmissionsWithAllocations()
			.then((data) => {
				setAdmissions(Array.isArray(data) ? data : []);
			})
			.catch(() => setAdmissions([]))
			.finally(() => setLoading(false));
	}, []);

	// Filter admissions based on search, status, and date
	const filteredAdmissions = admissions.filter((adm) => {
		const patientName = adm.patientName?.toLowerCase() || "";
		const patientId = String(adm.admissionId || "");
		const phone = adm.contactNumber || "";
		// No email or admissionDate in API response
		const statusMatch = true; // No status in API response
		const searchMatch =
			patientName.includes(search.toLowerCase()) ||
			patientId.includes(search) ||
			phone.includes(search);
		return statusMatch && searchMatch;
	});

	return (
		<div className="bg-[#FAFAF6] mt-2 font-inter">
			{showGenerateBill && (
				<GenerateBill onClose={() => setShowGenerateBill(false)} />
			)}
			{/* Navigation Tabs */}
			<div className="flex gap-2 items-center mb-3 w-full">
				<button
					className="w-[150px] h-[32px] rounded-[80px] cursor-pointer font-medium text-[13px] leading-[100%] bg-transparent text-black"
					onClick={() => navigate("/HospitalManagement/ipd-management")}
				>
					Patient Admission
				</button>
				<button
					className="w-[150px] h-[32px] rounded-[80px] cursor-pointer font-medium text-[13px] leading-[100%] bg-transparent text-black"
					onClick={() => navigate("/HospitalManagement/ipd/lifecycle")}
				>
					Patient Lifecycle
				</button>
				<button
					className="w-[150px] h-[32px] rounded-[80px] cursor-pointer font-medium text-[13px] leading-[100%] bg-blue-800 text-white shadow"
					onClick={() => navigate("/HospitalManagement/billing")}
				>
					Billing
				</button>

				<button
					className={`w-[150px] h-[32px] rounded-[80px] font-inter font-medium cursor-pointer text-[12px] leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "history"
							? "bg-blue-800 text-white shadow"
							: "bg-transparent text-black"}
          `}
					onClick={() => navigate("/HospitalManagement/patient-history")}
				>
					Patient History
				</button>

			</div>

			{/* Top Bar */}
			<div className="flex flex-col gap-3 mb-2">
				{/* Generate Bill Button */}
				<button
					className="self-start px-8 py-2 text-sm font-semibold text-white bg-blue-700 rounded-lg shadow transition cursor-pointer"
					onClick={() => setShowGenerateBill(true)}
				>
					+ Generate Bill
				</button>

				{/* Filters Row */}
				<div className="flex flex-col gap-2 items-center md:flex-row">
					<input
						type="text"
						placeholder="Search"
						value={search}
						onChange={e => setSearch(e.target.value)}
						className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 md:w-64"
					/>
					<div className="flex gap-2 items-center w-full md:w-auto">
						<input
							type="date"
							value={dateFrom}
							onChange={e => setDateFrom(e.target.value)}
							className="px-2 py-2 text-sm rounded-lg border border-gray-300"
						/>
						<span className="mx-1 text-gray-500">TO</span>
						<input
							type="date"
							value={dateTo}
							onChange={e => setDateTo(e.target.value)}
							className="px-2 py-2 text-sm rounded-lg border border-gray-300"
						/>
					</div>
					<select
						value={status}
						onChange={e => setStatus(e.target.value)}
						className="px-3 py-2 text-sm bg-white rounded-lg border border-gray-300"
					>
						<option value="">Status</option>
						<option value="paid">Paid</option>
						<option value="unpaid">Unpaid</option>
					</select>
					<div className="flex gap-2 items-center ml-auto">
						<FaFileExcel
							className="text-green-600 cursor-pointer hover:text-green-800"
							size={24}
							title="Export to Excel"
							onClick={() => { /* TODO: Add Excel export logic */ }}
						/>
						<FaFilePdf
							className="text-red-600 cursor-pointer hover:text-red-800"
							size={24}
							title="Export to PDF"
							onClick={() => { /* TODO: Add PDF export logic */ }}
						/>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="flex flex-col h-[320px] bg-white rounded-md shadow-sm mt-2">
				<div className="">
					<table className="min-w-full text-sm">
						<thead className="font-medium text-black border-b border-black">
							<tr className="h-12">
								<th className="px-3 py-3 text-left">S. No.</th>
								<th className="px-3 py-3 text-left">Patient name</th>
								<th className="px-3 py-3 text-left">Admission ID</th>
								<th className="px-3 py-3 text-left">Phone No.</th>
								<th className="px-3 py-3 text-left">Action</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td colSpan={5} className="bg-white"></td>
							</tr>

							{loading && (
								<tr><td colSpan={5} className="py-6 text-center text-gray-500">Loading...</td></tr>
							)}

							{!loading && filteredAdmissions.length === 0 && (
								<tr><td colSpan={5} className="py-6 text-center text-gray-500">No records found.</td></tr>
							)}

							{!loading && filteredAdmissions.map((adm, idx) => (
								<tr
									key={adm.admissionInfo?.admissionId || idx}
									className="h-10 border-b transition hover:bg-gray-50 odd:bg-white even:bg-blue-100"
								>
									<td className="px-2 py-2">{idx + 1}.</td>
									<td className="px-2 py-2">{adm.patientName}</td>
									<td className="px-2 py-2">{adm.admissionId}</td>
									<td className="px-2 py-2">{adm.contactNumber}</td>
									<td className="px-2 py-2">
										<button
											className="bg-[#f3dea9] text-[#422] rounded-full px-3 py-1 cursor-pointer text-[10px] font-semibold shadow hover:bg-[#FFD966] transition"
											onClick={async () => {
												setPreviewError("");
												setPreviewLoading(true);
												try {
													const preview = await previewBill(adm.admissionId || adm.admissionInfo?.admissionId);
													navigate('/HospitalManagement/bill', { state: { preview } });
												} catch (err) {
													console.error('Preview bill failed', err);
													setPreviewError(err.message || 'Failed to fetch preview');
												} finally {
													setPreviewLoading(false);
												}
											}}
										>
											{previewLoading ? 'Loading…' : 'Preview Bill'}
										</button>
										{previewError && <div className="mt-1 text-xs text-red-600">{previewError}</div>}
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{/* Pagination Controls */}
					<div className="flex gap-2 justify-center items-center mt-2 mb-4 text-xs">
						<button
							className={`w-8 h-8 flex items-center justify-center rounded-lg border ${filteredAdmissions.length === 0 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
							disabled={filteredAdmissions.length === 0}
							aria-label="Previous page"
						>
							<span className="text-lg">&lt;</span>
						</button>
						<button
							className={`flex justify-center items-center w-8 h-8 font-bold text-white bg-blue-600 rounded-lg`}
							style={{ boxShadow: "0 2px 8px 0 rgba(24, 144, 255, 0.08)" }}
							disabled
						>
							{filteredAdmissions.length === 0 ? 0 : 1}
						</button>
						<span className="mx-1 font-semibold text-black">of</span>
						<button
							className={`flex justify-center items-center w-8 h-8 font-bold text-blue-600 bg-white rounded-lg border border-blue-500`}
							style={{ boxShadow: "0 2px 8px 0 rgba(24, 144, 255, 0.08)" }}
							disabled
						>
							{filteredAdmissions.length === 0 ? 0 : 1}
						</button>
						<button
							className={`w-8 h-8 flex items-center justify-center rounded-lg border ${filteredAdmissions.length === 0 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
							disabled={filteredAdmissions.length === 0}
							aria-label="Next page"
						>
							<span className="text-lg">&gt;</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Billing;
