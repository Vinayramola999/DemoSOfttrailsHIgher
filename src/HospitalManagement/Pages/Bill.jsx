import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { generateFinalBill } from "../api/Service";
import { FaArrowLeft, FaEdit, FaPrint, FaDownload, FaShareAlt } from "react-icons/fa";

// ===== Navigation Tabs Component =====
const NavigationTabs = ({ onNavigate }) => {
  return (
    <div className="flex gap-2 mb-2 w-full items-center">
      <button
        className="w-[150px] h-[32px] rounded-[80px] font-medium text-[13px] leading-[100%] bg-transparent text-black"
        onClick={() => onNavigate("/ipd/admission")}
      >
        Patient Admission
      </button>
      <button
        className="w-[150px] h-[32px] rounded-[80px] font-medium text-[13px] leading-[100%] bg-transparent text-black"
        onClick={() => onNavigate("/ipd/lifecycle")}
      >
        Patient Lifecycle
      </button>
      <button
        className="w-[150px] h-[32px] rounded-[80px] font-medium text-[13px] leading-[100%] bg-blue-800 text-white shadow"
        onClick={() => onNavigate("/billing")}
      >
        Billing
      </button>
    </div>
  );
};

// ===== Left Action Group Component =====
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

// ===== Right Action Buttons Component =====
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

// ===== Action Bar Component =====
const ActionBar = ({ onBack }) => {
  return (
    <div
      className="bg-white mb-4 flex justify-between items-center"
      style={{
        width: "1240px",
        height: "70px",
        borderRadius: 8,
        border: "1px solid rgba(221,221,221,1)",
        background: "rgba(255,255,255,1)",
        padding: 12,
      }}
    >
      <LeftActionGroup onBack={onBack} />
      <RightActionButtons />
    </div>
  );
};

// ===== Patient Information Section =====
const PatientInformationSection = ({ preview }) => {
  return (
    <div className="bg-[#eaf1fb] rounded-lg p-6">
      <h3 className="text-blue-600 font-semibold flex items-center gap-2 mb-4 text-lg">
        <img src="https://img.icons8.com/color/24/patient-care.png" alt="Patient" />
        Patient Information
      </h3>
      <p className="text-base mb-1">
        <span className="font-semibold">Name:</span> {preview?.patientInfo?.name ?? "Sarah Johnson"}
      </p>
      <p className="text-base mb-1">
        <span className="font-semibold">Patient ID:</span> {preview?.patientInfo?.patientId ?? "PT-2024-0156"}
      </p>
      <p className="text-base mb-1">
        <span className="font-semibold">Date of Birth:</span> {preview?.patientInfo?.dob ?? "March 15, 1985"}
      </p>
      <p className="text-base mb-1">
        <span className="font-semibold">Address:</span> {preview?.patientInfo?.address ?? "456 Oak Street, City, ST 67890"}
      </p>
      <p className="text-base">
        <span className="font-semibold">Phone:</span> {preview?.patientInfo?.phone ?? "(555) 987-6543"}
      </p>
    </div>
  );
};

// ===== Admission Details Section =====
const AdmissionDetailsSection = ({ preview }) => {
  return (
    <div className="bg-[#eafbf1] rounded-lg p-6">
      <h3 className="text-green-600 font-semibold flex items-center gap-2 mb-4 text-lg">
        <img src="https://img.icons8.com/color/24/treatment-plan.png" alt="Admission" />
        Admission Details
      </h3>
      <p className="text-base mb-1">
        <span className="font-semibold">Admission Date:</span> {preview?.admissionInfo?.admissionDate ?? "January 10, 2024"}
      </p>
      <p className="text-base mb-1">
        <span className="font-semibold">Discharge Date:</span> {preview?.admissionInfo?.dischargeDate ?? "January 14, 2024"}
      </p>
      <p className="text-base mb-1">
        <span className="font-semibold">No of days Stay:</span> {preview?.admissionInfo?.lengthOfStay ?? "4 days"}
      </p>
    </div>
  );
};
const MedicalServicesTable = ({ preview }) => {
  return (
    <div className="mt-10">
      {/* Title */}
      <h3 className="text-blue-700 font-semibold flex items-center gap-2 mb-4 text-lg">
        <img src="https://img.icons8.com/color/24/list.png" alt="List" />
        Medical Services & Charges
      </h3>

      {/* Daily Breakdown */}
      {preview?.dailyBreakdown && Array.isArray(preview.dailyBreakdown) ? (
        preview.dailyBreakdown.map((day, dayIdx) => (
          <div key={dayIdx} className="mb-8">
            {/* Day Header */}
            <h4 className="text-gray-700 font-semibold mb-3 text-base bg-gray-100 p-2 rounded">
              Day {dayIdx + 1} — {new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </h4>

            {/* Day Table */}
            <div className="bg-white border border-gray-200 rounded mb-3">
              <table className="w-full text-left">
                {/* Header */}
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

                {/* Body */}
                <tbody className="text-gray-700">
                  {day.lineItems && Array.isArray(day.lineItems) && day.lineItems.length > 0 ? (
                    day.lineItems.map((item, itemIdx) => (
                      <tr key={itemIdx} className=" hover:bg-gray-50">
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

            {/* Day Summary */}
            <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold"> Gross Amount:</span>
                <span className="font-semibold">₹{Number(day.dayGross ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Discount Amount:</span>
                <span className="font-semibold text-red-600">₹{Number(day.dayDiscount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Tax Amount:</span>
                <span className="font-semibold">₹{Number(day.dayTax ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="font-bold">Net Amount:</span>
                <span className="font-bold text-blue-700">₹{Number(day.dayNet ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-gray-50 rounded p-4 text-center text-gray-500">
          No breakdown data available
        </div>
      )}
    </div>
  );
};

// ===== Insurance Coverage Section =====
const InsuranceCoverageSection = ({ preview, insuranceAmount, onInsuranceChange }) => {
  return (
    <div className="space-y-4">

      {/* Insurance Card */}
      <div className="bg-[#f8f2ff] rounded-xl p-6 border border-[#eddcff]">
        <h3 className="text-purple-700 font-semibold flex items-center gap-2 mb-4 text-lg">
          <img src="https://img.icons8.com/color/24/shield.png" alt="Insurance" />
          Insurance Coverage
        </h3>

        <p className="text-base mb-1">
          <span className="font-bold">Insurance Company:</span> {preview?.insuranceCompany ?? 'N/A'}
        </p>

        <p className="text-base mb-4">
          <span className="font-bold">Insurance Policy ID:</span> {preview?.insuranceId ?? 'N/A'}
        </p>

        {/* Insurance Amount Input */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-base">Insurance Amount:</span>
          <input
            type="text"
            className="border rounded-md px-3 py-1 w-40 outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="₹"
            
            onChange={onInsuranceChange}
          />
        </div>
      </div>

    </div>
  );
};

const PaymentSummarySection = ({ preview, insuranceAmount }) => {
  const grossAmount = Number(preview?.grossAmount ?? 0);
  const totalDiscount = Number(preview?.totalDiscount ?? 0);
  const totalTax = Number(preview?.totalTax ?? 0);
  const netAmount = Number(preview?.netAmount ?? 0);
  const advancePaid = Number(preview?.advancePaid ?? 0);
  const insuranceValue = insuranceAmount ? Number(insuranceAmount.replace(/[^0-9.-]/g, '')) : Number(preview?.insuranceAmount ?? 0);
  const finalPayable = netAmount - advancePaid - insuranceValue;

  return (
    <div className="bg-[#f3f4f8] rounded-xl p-6">
      {/* Title */}
      <h3 className="text-gray-700 font-semibold mb-4 text-lg">
        Payment Summary
      </h3>

      {/* Gross Amount */}
      <div className="text-base mb-2 flex justify-between">
        <span>Gross Amount:</span>
        <span className="font-bold text-gray-800">₹{grossAmount.toFixed(2)}</span>
      </div>

      {/* Total Discount */}
      <div className="text-base mb-2 flex justify-between">
        <span className="text-red-600">Total Discount:</span>
        <span className="font-bold text-red-600">− ₹{totalDiscount.toFixed(2)}</span>
      </div>

      {/* Total Tax */}
      <div className="text-base mb-2 flex justify-between">
        <span className="text-orange-600">Total Tax:</span>
        <span className="font-bold text-orange-600">₹{totalTax.toFixed(2)}</span>
      </div>

      {/* Net Amount */}
      <div className="text-base mb-4 flex justify-between border-b pb-2">
        <span className="font-semibold">Net Amount:</span>
        <span className="font-bold text-gray-900">₹{netAmount.toFixed(2)}</span>
      </div>

      {/* Advance Paid */}
      <div className="text-base mb-2 flex justify-between">
        <span className="text-blue-600">Advance Paid:</span>
        <span className="font-bold text-blue-600">− ₹{advancePaid.toFixed(2)}</span>
      </div>

      {/* Insurance Amount */}
      <div className="text-base mb-4 flex justify-between">
        <span className="text-green-700">Insurance Amount:</span>
        <span className="font-bold text-green-700">− ₹{insuranceValue.toFixed(2)}</span>
      </div>

      {/* Divider */}
      <hr className="mb-4" />

      {/* Final Payable */}
      <div className="text-lg font-bold flex justify-between">
        <span className="text-blue-700">Final Payable:</span>
        <span className="text-blue-700">₹{finalPayable.toFixed(2)}</span>
      </div>
    </div>
  );
};


// ===== Action Buttons Section =====
const ActionButtonsSection = ({ onGenerate }) => {
  return (
    <div className="flex justify-center  gap-4 mt-8 right-5">
      <button
        onClick={onGenerate}
        className="bg-blue-700 rounded-lg text-white px-8 py-2 font-sm flex items-center gap-2 cursor-pointer hover:bg-blue-800"
      >
        Generate Porforma Invoice
      </button>
    </div>
  );
};


// ===== Main Invoice Page Component =====
const InvoicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [insuranceAmount, setInsuranceAmount] = useState('');

  const preview = location?.state?.preview ?? null;

  // Initialize insurance amount from preview
  useEffect(() => {
    if (preview?.insuranceAmount !== undefined && preview?.insuranceAmount !== null && insuranceAmount === '') {
      setInsuranceAmount(`₹${Number(preview.insuranceAmount).toFixed(2)}`);
    }
  }, [preview?.insuranceAmount, insuranceAmount]);

  const handleInsuranceChange = (e) => {
    let value = e.target.value;
    // Remove rupee symbol and spaces, keep only numbers and decimal point
    value = value.replace(/[^0-9.]/g, '');
    if (value) {
      setInsuranceAmount(`₹${value}`);
    } else {
      setInsuranceAmount('');
    }
  };

  // Derive a normalized `lineItems` array from `dailyBreakdown` when
  // `preview.lineItems` is not present. This keeps existing UI intact
  // while allowing the page to render items coming from dailyBreakdown.
  const derivedLineItems = (() => {
    if (!preview) return null;
    if (Array.isArray(preview.lineItems) && preview.lineItems.length) return preview.lineItems;
    if (!Array.isArray(preview.dailyBreakdown)) return null;

    return preview.dailyBreakdown.flatMap((day) => {
      const dayDate = day?.date ?? null;
      if (!Array.isArray(day.lineItems)) return [];
      return day.lineItems.map((li) => {
        const unit = Number(li.unitPrice ?? li.unit_price ?? li.unit_amount ?? li.baseAmount ?? li.base_amount ?? li.amount ?? 0);
        const discount = Number(li.discountAmount ?? li.discount ?? 0);
        const tax = Number(li.taxAmount ?? li.tax ?? li.tax_amount ?? 0);
        const total = Number(li.total ?? li.totalAmount ?? li.total_amount ?? li.amountAfterDiscount ?? li.totalAmount ?? 0);

        return {
          // keep original fields
          ...li,
          // normalized date aliases
          date: li.date ?? li.serviceDate ?? li.dateOfService ?? dayDate,
          serviceDate: li.serviceDate ?? li.date ?? dayDate,
          dateOfService: li.dateOfService ?? li.date ?? dayDate,
          // description / name aliases
          description: li.description ?? li.serviceName ?? li.name ?? li.itemName ?? '',
          name: li.name ?? li.description ?? li.serviceName ?? '',
          itemName: li.itemName ?? li.name ?? li.description ?? '',
          // price aliases
          unitPrice: li.unitPrice ?? li.unit_price ?? li.unit_amount ?? unit,
          unit_amount: li.unit_amount ?? li.unitPrice ?? unit,
          unit_price: li.unit_price ?? li.unitPrice ?? unit,
          baseAmount: li.baseAmount ?? li.base_amount ?? unit,
          amount: li.amount ?? unit,
          // discount/tax/total aliases
          discountAmount: li.discountAmount ?? li.discount ?? discount,
          discount: li.discount ?? li.discountAmount ?? discount,
          taxAmount: li.taxAmount ?? li.tax ?? tax,
          tax: li.tax ?? li.taxAmount ?? tax,
          totalAmount: li.totalAmount ?? li.total_amount ?? total,
          total: li.total ?? li.totalAmount ?? total,
          amountAfterDiscount: li.amountAfterDiscount ?? li.totalAmount ?? total,
          totalAfterDiscount: li.totalAfterDiscount ?? li.totalAmount ?? total,
        };
      });
    });
  })();

  const handleGenerate = async () => {
    if (!preview) {
      console.error('No preview available to generate final bill');
      return;
    }

    // Try to derive the admissionId from common preview shapes
    const admissionId = preview?.admissionInfo?.admissionId ?? preview?.admissionId ?? preview?.admission?.id;
    if (!admissionId) {
      console.error('Admission ID not found in preview, cannot generate final bill');
      return;
    }

    // Extract the numeric insurance amount value (strip currency symbols)
    let insuranceAmountValue = 0;
    try {
      insuranceAmountValue = insuranceAmount ? Number(insuranceAmount.replace(/[^0-9.-]/g, '')) : 0;
    } catch {
      insuranceAmountValue = 0;
    }

    if (Number.isNaN(insuranceAmountValue)) {
      alert('Insurance amount must be a valid number');
      return;
    }

    // Frontend validations per spec
    const grossAmount = Number(preview?.grossAmount ?? 0);
    const netAmount = Number(preview?.netAmount ?? 0);
    const advancePaid = Number(preview?.advancePaid ?? 0);

    if (insuranceAmountValue < 0) {
      alert('Insurance amount cannot be negative');
      return;
    }
    if (insuranceAmountValue > grossAmount) {
      alert('Insurance amount cannot exceed gross amount');
      return;
    }
    if (insuranceAmountValue > netAmount) {
      alert('Insurance amount cannot exceed net amount');
      return;
    }
    if (insuranceAmountValue > (netAmount - advancePaid)) {
      alert('Insurance amount cannot exceed (net amount - advance paid)');
      return;
    }

    try {
      const finalBill = await generateFinalBill(admissionId, insuranceAmountValue);
      // Navigate to FinalBill page and pass the final bill in state
      navigate('/HospitalManagement/Final-Bill', { state: { final: finalBill, admissionId } });
    } catch (err) {
      console.error('Failed to generate final bill:', err);
      alert(err.message || 'Failed to generate final bill');
    }
  };

  return (
    <div className="bg-[#FAFAF6]  p-2">
      {/* Navigation Tabs */}
      <NavigationTabs onNavigate={navigate} />

      {/* Action Bar */}
      <ActionBar onBack={() => navigate(-1)} />

      {/* Invoice Card */}
      <div className="bg-white shadow rounded-lg p-6" style={{ width: "1100px", marginLeft: "auto", marginRight: "auto" }}>
        {preview && (
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Invoice: <span className="font-semibold text-gray-900">{preview.invoiceNumber}</span></div>
            <div className="text-sm text-gray-600">Generated: <span className="font-semibold text-gray-900">{new Date(preview.generatedAt).toLocaleString()}</span></div>
          </div>
        )}
        {/* Info Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          <PatientInformationSection preview={preview} />
          <AdmissionDetailsSection preview={preview} />
        </div>

        {/* Medical Services Table */}
        <MedicalServicesTable preview={preview ? { ...preview, lineItems: derivedLineItems } : preview} />

        {/* Insurance Coverage & Payment Summary Section */}
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <InsuranceCoverageSection preview={preview} insuranceAmount={insuranceAmount} onInsuranceChange={handleInsuranceChange} />
          <PaymentSummarySection preview={preview} insuranceAmount={insuranceAmount} />
        </div>

        {/* Action Buttons */}
        <ActionButtonsSection onGenerate={handleGenerate} />
      </div>
    </div>
  );
};

export default InvoicePage;
