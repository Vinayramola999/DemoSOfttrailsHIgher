
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaEdit, FaPrint, FaDownload, FaShareAlt } from "react-icons/fa";
import { getFinalizedBill, generateFinalBill } from "../api/Service";

// --- Reusable subcomponents (match structure used in Bill.jsx) ---
const NavigationTabs = ({ navigate }) => (
  <div className="flex gap-2 mb-2 w-full ">
    <button
      className="w-[150px] h-[32px] rounded-[80px] font-medium text-[13px] leading-[100%] bg-transparent text-black"
      onClick={() => navigate("/HospitalManagement/ipd/admission")}
    >
      Patient Admission
    </button>
    <button
      className="w-[150px] h-[32px] rounded-[80px] font-medium text-[13px] leading-[100%] bg-transparent text-black"
      onClick={() => navigate("/HospitalManagement/ipd/lifecycle")}
    >
      Patient Lifecycle
    </button>
    <button
      className="w-[150px] h-[32px] rounded-[80px] font-medium text-[13px] leading-[100%] bg-blue-800 text-white shadow"
      onClick={() => navigate("/HospitalManagement/billing")}
    >
      Billing
    </button>
  </div>
);

const LeftActionGroup = ({ onBack }) => (
  <div className="flex gap-3 items-center">
    <button
      onClick={onBack}
      aria-label="Back"
      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100"
    >
      <FaArrowLeft className="w-4 h-4 text-gray-700" />
    </button>

    <button className="w-[45px] h-[45px] relative border rounded-md bg-transparent hover:bg-gray-100">
      <FaEdit size={12} className="text-[#636363] absolute top-2 left-4" />
      <span className="text-[10px] font-medium text-[#636363] absolute left-1/2 transform -translate-x-1/2 bottom-2 leading-[100%]">Edit</span>
    </button>
  </div>
);

const RightActionButtons = () => (
  <div className="flex gap-3">
    <button className="w-[45px] h-[45px] relative border rounded-md bg-transparent hover:bg-gray-100">
      <FaPrint size={12} className="text-[#636363] absolute top-2 left-4" />
      <span className="text-[10px] font-medium text-[#636363] absolute left-1/2 transform -translate-x-1/2 bottom-2 leading-[100%]">Print</span>
    </button>

    <button className="w-[60px] h-[45px] relative border rounded-md bg-transparent hover:bg-gray-100">
      <FaDownload size={12} className="text-[#636363] absolute top-2 left-6" />
      <span className="text-[10px] font-medium text-[#636363] absolute left-1/2 transform -translate-x-1/2 bottom-2 leading-[100%]">Download</span>
    </button>

    <button className="w-[45px] h-[45px] relative border rounded-md bg-transparent hover:bg-gray-100">
      <FaShareAlt size={12} className="text-[#636363] absolute top-2 left-4" />
      <span className="text-[10px] font-medium text-[#636363] absolute left-1/2 transform -translate-x-1/2 bottom-2 leading-[100%]">Share</span>
    </button>
  </div>
);

const ActionBar = ({ onBack }) => (
  <div
    className="bg-white border rounded-lg shadow-sm p-3 mb-6 flex justify-between items-center"
    style={{ width: "1240px", height: "70px", borderRadius: 8, border: "1px solid rgba(221,221,221,1)", background: "rgba(255,255,255,1)", padding: 12 }}
  >
    <LeftActionGroup onBack={onBack} />
    <RightActionButtons />
  </div>
);

const PatientInformationSection = ({ patient = {} }) => (
  <div className="bg-[#eaf1fb] rounded-lg p-6">
    <h3 className="text-blue-600 font-semibold flex items-center gap-2 mb-4 text-lg">
      <img src="https://img.icons8.com/color/24/patient-care.png" alt="Patient" />
      Patient Information
    </h3>
    <p className="text-base mb-1"><span className="font-semibold">Name:</span> {patient.name ?? '—'}</p>
    <p className="text-base mb-1"><span className="font-semibold">Patient ID:</span> {patient.patientId ?? patient.patientID ?? '—'}</p>
    <p className="text-base mb-1"><span className="font-semibold">Date of Birth:</span> {patient.dob ?? '—'}</p>
    {/* <p className="text-base mb-1"><span className="font-semibold">Insurance ID:</span> {patient.insuranceId ?? patient.insuranceID ?? '—'}</p> */}
    <p className="text-base mb-1"><span className="font-semibold">Address:</span> {patient.address ?? '—'}</p>
    <p className="text-base"><span className="font-semibold">Phone:</span> {patient.phone ?? '—'}</p>
  </div>
);

const AdmissionDetailsSection = ({ admission = {} }) => (
  <div className="bg-[#eafbf1] rounded-lg p-6">
    <h3 className="text-green-600 font-semibold flex items-center gap-2 mb-4 text-lg">
      <img src="https://img.icons8.com/color/24/treatment-plan.png" alt="Admission" />
      Admission Details
    </h3>
    <p className="text-base mb-1"><span className="font-semibold">Admission Date:</span> {admission.admissionDate ? new Date(admission.admissionDate).toLocaleDateString() : '—'}</p>
    <p className="text-base mb-1"><span className="font-semibold">Discharge Date:</span> {admission.dischargeDate ? new Date(admission.dischargeDate).toLocaleDateString() : '—'}</p>
    <p className="text-base mb-1"><span className="font-semibold">Length of Stay:</span> {admission.lengthOfStay ?? admission.lengthOfStay ?? '—'}</p>
  </div>
);

const MedicalServicesTable = ({ dailyBreakdown = [] }) => (
  <div className="mt-10">
    <h3 className="text-blue-700 font-semibold flex items-center gap-2 mb-4 text-lg">
      <img src="https://img.icons8.com/color/24/list.png" alt="List" />
      Medical Services & Charges
    </h3>
    {Array.isArray(dailyBreakdown) && dailyBreakdown.length > 0 ? (
      dailyBreakdown.map((day, idx) => (
        <div key={idx} className="mb-6">
          <h4 className="text-gray-700 font-semibold mb-3 text-base bg-gray-100 p-2 rounded">Day {idx + 1} — {new Date(day.date).toLocaleDateString()}</h4>
          <div className="bg-white border border-gray-200 rounded mb-3">
            <table className="w-full text-left">
              <thead className="bg-[#f3f6fa]">
                <tr className="text-gray-700 font-semibold">
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Base</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Tax</th>
                  <th className="py-3 px-4">Total</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {Array.isArray(day.lineItems) && day.lineItems.length > 0 ? (
                  day.lineItems.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{item.serviceName ?? item.description ?? item.name ?? ''}</td>
                      <td className="py-3 px-4">{item.quantity ?? 1}</td>
                      <td className="py-3 px-4">₹{Number(item.baseAmount ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-4">₹{Number(item.discountAmount ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-4">₹{Number(item.taxAmount ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">₹{Number(item.totalAmount ?? 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-3 px-4 text-center text-gray-500">No items for this day</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="font-semibold">Day Gross:</span><span className="font-semibold">₹{Number(day.dayGross ?? 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Day Discount:</span><span className="font-semibold text-red-600">₹{Number(day.dayDiscount ?? 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Day Tax:</span><span className="font-semibold">₹{Number(day.dayTax ?? 0).toFixed(2)}</span></div>
            <div className="flex justify-between border-t pt-1"><span className="font-bold">Day Net:</span><span className="font-bold text-blue-700">₹{Number(day.dayNet ?? 0).toFixed(2)}</span></div>
          </div>
        </div>
      ))
    ) : (
      <div className="bg-gray-50 rounded p-4 text-center text-gray-500">No breakdown data available</div>
    )}
  </div>
);

const InsuranceCoverageSection = ({ insurance = {}, patient = {} }) => {
  const provider = insurance.provider || insurance.providerName || patient.insuranceProvider || insurance.company || '—';
  const policy = insurance.policyNumber || insurance.policyNo || patient.policyNumber || insurance.policy || '—';
  const type = insurance.coverageType || insurance.type || '—';
  const deductible = (typeof insurance.deductible !== 'undefined' && insurance.deductible !== null)
    ? `₹${Number(insurance.deductible).toFixed(2)}`
    : (insurance.deductibleAmount ? `₹${Number(insurance.deductibleAmount).toFixed(2)}` : '—');
  const copay = (typeof insurance.coPayment !== 'undefined' && insurance.coPayment !== null)
    ? `₹${Number(insurance.coPayment).toFixed(2)}`
    : (insurance.co_payment ? `₹${Number(insurance.co_payment).toFixed(2)}` : '—');
  const coveragePct = (typeof insurance.coveragePercent !== 'undefined' && insurance.coveragePercent !== null)
    ? `${Number(insurance.coveragePercent)}%`
    : (typeof insurance.coverage === 'number' ? `${insurance.coverage}%` : (insurance.coverage ? `${insurance.coverage}` : '—'));

  return (
    <div className="bg-[#f6f1fd] rounded-xl p-6">
      <h3 className="text-purple-700 font-semibold flex items-center gap-2 mb-4 text-lg">
        <img src="https://img.icons8.com/color/24/shield.png" alt="Insurance" />
        Insurance Coverage
      </h3>
      <p className="text-base mb-1"><span className="font-bold">Insurance Provider:</span> {provider}</p>
      <p className="text-base mb-1"><span className="font-bold">Policy Number:</span> {policy}</p>
      <p className="text-base mb-1"><span className="font-bold">Insurance Amount:</span> {type}</p>
      {/* <p className="text-base mb-1"><span className="font-bold">Deductible:</span> {deductible}</p>
      <p className="text-base mb-1"><span className="font-bold">Co-payment:</span> {copay}</p>
      <p className="text-base"><span className="font-bold">Coverage %:</span> {coveragePct}</p> */}
    </div>
  );
};

const PaymentSummarySection = ({ summary = {}, insuranceValue, onInsuranceChange, editable }) => (
  <div className="bg-[#f3f4f8] rounded-xl p-6">
    <h3 className="text-gray-700 font-semibold mb-4 text-lg">Payment Summary</h3>
    <div className="text-base mb-2 flex justify-between"><span>Gross Amount:</span><span className="font-bold text-gray-800">{typeof summary.grossAmount !== 'undefined' ? `₹${Number(summary.grossAmount).toFixed(2)}` : '₹0.00'}</span></div>
    <div className="text-base mb-2 flex justify-between"><span className="text-red-600">Total Discount:</span><span className="font-bold text-red-600">− {typeof summary.totalDiscount !== 'undefined' ? `₹${Number(summary.totalDiscount).toFixed(2)}` : '₹0.00'}</span></div>
    <div className="text-base mb-2 flex justify-between"><span className="text-orange-600">Total Tax:</span><span className="font-bold text-orange-600">{typeof summary.totalTax !== 'undefined' ? `₹${Number(summary.totalTax).toFixed(2)}` : '₹0.00'}</span></div>

    <div className="text-base mb-4 flex justify-between border-b pb-2">
      <span className="font-semibold">Net Amount:</span>
      <span className="font-bold text-gray-900">{typeof summary.netAmount !== 'undefined' ? `₹${Number(summary.netAmount).toFixed(2)}` : '₹0.00'}</span>
    </div>

    <div className="text-base mb-2 flex justify-between">
      <span className="text-blue-600">Advance Paid:</span>
      <span className="font-bold text-blue-600">− {typeof summary.advancePaid !== 'undefined' ? `₹${Number(summary.advancePaid).toFixed(2)}` : '₹0.00'}</span>
    </div>

    <div className="text-base mb-4 flex justify-between items-center">
      <span className="text-green-700">Insurance Amount:</span>
      {/* if an input handler was supplied, render an input, otherwise show value */}
      {editable ? (
        <input
          value={insuranceValue ?? ''}
          onChange={onInsuranceChange}
          placeholder="₹"
          className="border rounded px-2 py-1 w-36"
        />
      ) : (
        <span className="font-bold text-green-700">− {typeof summary.insuranceAmount !== 'undefined' ? `₹${Number(summary.insuranceAmount).toFixed(2)}` : '₹0.00'}</span>
      )}
    </div>

    <hr className="mb-4" />

    <div className="text-lg font-bold flex justify-between">
      <span className="text-blue-700">Final Payable:</span>
      <span className="text-blue-700">{typeof summary.payableAmount !== 'undefined' ? `₹${Number(summary.payableAmount).toFixed(2)}` : '₹0.00'}</span>
    </div>
  </div>
);

const ActionButtonsSection = ({ onGenerateBill, onConfirm, confirmLabel = 'Confirm Final Bill', disabled = false, loading = false, showGenerateBtn = true, showConfirmBtn = false }) => (
  <div className="flex justify-center gap-4 mt-8 right-5">
    {showGenerateBtn && (
      <button
        className="bg-blue-700 text-white rounded-lg px-8 py-2 font-medium flex items-center gap-2 hover:bg-blue-800"
        onClick={onGenerateBill}
      >
        Generate bill
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </button>
    )}
    {showConfirmBtn && (
      <button
        className="bg-green-700 text-white rounded-lg px-8 py-2 font-medium flex items-center gap-2 hover:bg-green-800 disabled:opacity-60"
        onClick={onConfirm}
        disabled={disabled || loading}
      >
        {loading ? 'Processing...' : confirmLabel}
      </button>
    )}
  </div>
);

const FinalBill = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedFinal = location.state?.final ?? null;
  const admissionId = location.state?.admissionId ?? null;

  const [finalBill, setFinalBill] = useState(passedFinal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insuranceAmount, setInsuranceAmount] = useState(passedFinal?.insuranceAmount ? `₹${Number(passedFinal.insuranceAmount).toFixed(2)}` : '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!finalBill && admissionId) {
      setLoading(true);
      getFinalizedBill(admissionId)
        .then((data) => {
          console.log('API Response:', data);
          setFinalBill(data);
        })
        .catch((err) => {
          console.error('API Error:', err);
          setError(err.message || 'Failed to fetch finalized bill');
        })
        .finally(() => setLoading(false));
    }
  }, [finalBill, admissionId]);

  // keep insurance amount in sync when finalBill loads
  useEffect(() => {
    if (finalBill && (finalBill.insuranceAmount !== undefined) && !insuranceAmount) {
      setInsuranceAmount(`₹${Number(finalBill.insuranceAmount).toFixed(2)}`);
    }
  }, [finalBill, insuranceAmount]);

  const handleInsuranceChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, '');
    if (value) setInsuranceAmount(`₹${value}`);
    else setInsuranceAmount('');
  };

  const isFinalized = Boolean(finalBill && finalBill.invoiceNumber && !String(finalBill.invoiceNumber).startsWith('PREVIEW'));

  const handleConfirm = async () => {
    setSubmitError(null);
    if (!admissionId) {
      setSubmitError('Admission ID is missing');
      return;
    }

    let insuranceValue = 0;
    try {
      insuranceValue = insuranceAmount ? Number(insuranceAmount.replace(/[^0-9.-]/g, '')) : 0;
    } catch {
      insuranceValue = 0;
    }

    if (Number.isNaN(insuranceValue)) {
      setSubmitError('Insurance amount must be a valid number');
      return;
    }

    const grossAmount = Number(finalBill?.grossAmount ?? 0);
    const netAmount = Number(finalBill?.netAmount ?? 0);
    const advancePaid = Number(finalBill?.advancePaid ?? 0);

    if (insuranceValue < 0) {
      setSubmitError('Insurance amount cannot be negative');
      return;
    }
    if (insuranceValue > grossAmount) {
      setSubmitError('Insurance amount cannot exceed gross amount');
      return;
    }
    if (insuranceValue > netAmount) {
      setSubmitError('Insurance amount cannot exceed net amount');
      return;
    }
    if (insuranceValue > (netAmount - advancePaid)) {
      setSubmitError('Insurance amount cannot exceed (net amount - advance paid)');
      return;
    }

    try {
      setSubmitting(true);
      const result = await generateFinalBill(admissionId, insuranceValue);
      // update UI with finalized bill returned from server
      setFinalBill(result);
    } catch (err) {
      console.error('Failed to confirm final bill:', err);
      setSubmitError(err.message || 'Failed to confirm final bill');
    } finally {
      setSubmitting(false);
    }
  };

  

  if (loading) {
    return (
      <div className="bg-[#FAFAF6] min-h-screen p-2 flex items-center justify-center">
        <div className="bg-white p-6 rounded">Loading finalized bill...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FAFAF6] min-h-screen p-2 flex items-center justify-center">
        <div className="bg-white p-6 rounded text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAF6] min-h-screen p-2">
      <NavigationTabs navigate={navigate} />

      <ActionBar onBack={() => navigate(-1)} />

      {/* Invoice Card */}
      <div className="bg-white shadow rounded-lg p-8" style={{ width: "1100px", marginLeft: "auto", marginRight: "auto" }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          {/* Hospital Info */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img
                src="https://img.icons8.com/color/48/hospital-room.png"
                alt="Hospital"
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#222]">MediCare Hospital</h1>
                <p className="text-base text-gray-500">Excellence in Healthcare</p>
              </div>
            </div>
            <p className="text-base text-gray-600">
              123 Medical Center Drive <br />
              Healthcare City, HC 12345 <br />
              Phone: (555) 123-4567 <br />
              Email: billing@medicare.com
            </p>
          </div>

          {/* Invoice Info */}
          <div className="text-right">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">{isFinalized ? 'INVOICE' : 'PROFORMA INVOICE'}</h2>
            <div className="bg-gray-100 p-5 rounded-lg text-base min-w-[220px]">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Invoice Number :-  </span>
                <span className="font-semibold">{finalBill?.invoiceNumber ? finalBill.invoiceNumber : 'PREVIEW'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold">
                  {finalBill?.generatedAt || finalBill?.invoiceDate ? 
                    new Date(finalBill.generatedAt || finalBill.invoiceDate).toLocaleDateString() 
                    : new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date</span>
                <span className="font-semibold">
                  {finalBill?.dueDate 
                    ? new Date(finalBill.dueDate).toLocaleDateString() 
                    : new Date(new Date().getTime() + 30*24*60*60*1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8" />

        {/* Info Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          <PatientInformationSection patient={finalBill?.patientInfo} />
          <AdmissionDetailsSection admission={finalBill?.admissionInfo} />
        </div>

        <MedicalServicesTable dailyBreakdown={finalBill?.dailyBreakdown} />

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <InsuranceCoverageSection
            insurance={
              finalBill?.insuranceInfo
              ?? finalBill?.insurance
              ?? (finalBill ? {
                providerName: finalBill.insuranceCompany ?? finalBill.insuranceProvider,
                policyNumber: finalBill.insuranceId ?? finalBill.insuranceID ?? finalBill.policyNumber,
                coverageType: finalBill.insuranceAmount ? `₹${Number(finalBill.insuranceAmount).toFixed(2)}` : undefined,
                deductible: finalBill.deductible ?? finalBill.deductibleAmount,
                coPayment: finalBill.coPayment ?? finalBill.co_payment,
                coveragePercent: finalBill.coveragePercent ?? finalBill.coverage
              } : undefined)
            }
            patient={finalBill?.patientInfo}
          />
          <PaymentSummarySection
            summary={finalBill ?? { grossAmount: 0, totalDiscount: 0, totalTax: 0, netAmount: 0, advancePaid: 0, insuranceAmount: 0, payableAmount: 0 }}
            insuranceValue={insuranceAmount}
            onInsuranceChange={handleInsuranceChange}
            editable={!isFinalized}
          />
        </div>

        {/* Action Buttons */}
        {submitError && (
          <div className="text-red-600 text-sm mt-4 text-center">{submitError}</div>
        )}
        <ActionButtonsSection
          onGenerateBill={() => console.log('Generate bill clicked')}
          onConfirm={handleConfirm}
          confirmLabel="Confirm Final Bill"
          loading={submitting}
          showGenerateBtn={true}
          showConfirmBtn={!isFinalized}
        />
      </div>
    </div>
  );
};

export default FinalBill;
