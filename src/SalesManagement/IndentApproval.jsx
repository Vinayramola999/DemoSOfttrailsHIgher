import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { showCustomAlert } from "./components/CustomAlert";
import LeadsTable from "./components/LeadsTable";
// import { faEdit } from "@fortawesome/free-solid-svg-icons";
// const baseUrl = process.env.REACT_APP_URL_sales;
const baseUrl = process.env.REACT_APP_URL_sales || '';
// Reject Modal Component
const RejectModal = ({ onClose, onSubmit }) => {
  const [reason, setReason] = React.useState("");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-xl w-[420px] relative z-[10000]">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Reject</h2>
          <button className="text-red-500 hover:text-red-700" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <label className="block mb-2 font-medium">Reason</label>
          <textarea
            className="w-full border rounded px-3 py-2 mb-6"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason"
          />
          <div className="flex justify-center gap-4 mt-2">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={() => onSubmit(reason)}
            >
              Submit
            </button>
            <button
              className="border border-gray-500 text-black px-6 py-2 rounded hover:bg-gray-100"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const IndentApproval = () => {
  const [searchQuery, setSearchQuery] = useState(""); 
  const [startDate, setStartDate] = useState(""); 
  const [endDate, setEndDate] = useState(""); 
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [selectedDoc, setSelectedDoc] = useState(null); 
  const [selectedRe, setSelectedRe] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null); 
  const [editableIndents, setEditableIndents] = useState([]); 
  const [editingIndex, setEditingIndex] = useState(null); 
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingDocId, setRejectingDocId] = useState(null);

const itemsPerPage = 25;//changes 2
// useEffect(() => {
//   if (selectedRe?.indents) {
//     setEditableIndents(selectedRe.indents || []);
//     setEditingIndex(null); // reset editing state
//   }
// }, [selectedRe]);

useEffect(() => {
  if (selectedRe?.indents) {
    // Workflow mapping: normalize indents from the selected requirement
    // into the local `editableIndents` array so they can be edited.
    // Notes:
    // - Each indent includes `workflow_id` which ties it to any workflow steps
    //   managed server-side.
    // - `budget` and `lead_uid` are copied from the parent document so the
    //   backend can associate indents correctly during update/create.
    // - `isNew` is used locally to mark rows that should be created (no id).
    // editableIndents is the source of truth for the resubmit modal edit table.
    const mappedIndents = selectedRe.indents.map((i) => ({
      id: i.id, // database id
      request_for: i.request_for || "",
      category: i.category || "",
      asset_name: i.asset_name || "",
      quantity: i.quantity || "",
      uom: i.uom || "",
      remarks: i.remarks || "",
      workflow_id: i.workflow_id || null,
      budget: selectedRe.budget_id || null,
      lead_uid: selectedRe.lead_uid || null,
      isNew: false, // existing indent
    }));

    setEditableIndents(mappedIndents);
    setEditingIndex(null);
    setHasInitialized(true);
  }
}, [selectedRe, hasInitialized]);


const closeModal = () => {
  setSelectedRe(null);
  setHasInitialized(false); // reset so it runs next time
};


//changes 3
const handleIndentChange = (index, field, value) => {
  const updated = [...editableIndents];
  updated[index][field] = value;
  setEditableIndents(updated);
};

//change 5
const removeIndent = (index) => {
  const updated = [...editableIndents];
  updated.splice(index, 1);
  setEditableIndents(updated);
};


//changes 4
// const addNewIndent = () => {
//   const newIndent = {
//     request_for: "",
//     category: "",
//     asset_name: "",
//     quantity: "",
//     uom: "",
//     remarks: "",
//     isNew: true,
//   };
//   const updatedIndents = [...editableIndents, newIndent]; // local variable, no new state needed
//   setEditableIndents(updatedIndents);                     // update the state with new list
//   setEditingIndex(updatedIndents.length - 1); 
// };
const addNewIndent = () => {
  const lastIndent = editableIndents[editableIndents.length - 1];

  if (lastIndent && !lastIndent.asset_name) {
    alert("Please fill in the last indent before adding a new one.");
    return;
  }

  const newIndent = {
    id: null,
    request_for: "Sales",
    category: "",
    asset_name: "",
    quantity: "",
    uom: "",
    remarks: "",
    budget: selectedRe?.budget_id || null,
    lead_uid: selectedRe?.lead_uid || null,
    workflow_id: null,
    isNew: true,
  };

  const updatedIndents = [...editableIndents, newIndent];
  setEditableIndents(updatedIndents);
  // setEditingIndex(updatedIndents.length - 1);
  setEditingIndex(editableIndents.length);

};



//changes edit indent 
// const handleSubmitIndents = async () => {
//   if (!selectedRe || !editableIndents.length) return;

//     const preparedIndents = editableIndents
//     .filter((indent) => indent.asset_name && indent.quantity)
//     .map((indent) => ({
//     ...indent,
//     lead_uid: selectedRe?.lead_uid || null,
//     budget: selectedRe?.budget_id || null,
//   }));

//   try {
//     const token = sessionStorage.getItem("token"); // if needed

//     const response = await fetch(
//       `${baseUrl}/salesmanagement/indent/update-or-create-indents/${selectedRe.lead_id}`,
//       {

//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           user_id: selectedRe?.user_id,         // Replace with your user context
//           customer_id: selectedRe.customer_id,
//           // indents: editableIndents,
//           indents:preparedIndents,
//         }),
//       }
//     );

//     const result = await response.json();

//     if (response.ok) {
//       console.log("Success:", result);
//       alert("Indents submitted successfully!");

//       // Optionally refresh state or close modal
     
//         // ✅ Now trigger status update
//       updateStatus(selectedRe.reference_number, "Pending");
//       // setSelectedRe(null);
//        closeModal();

//     } else {
//       console.error("Failed:", result);
//       alert(result.message || "Submission failed");
//     }
//   } catch (err) {
//     console.error("Error:", err);
//     alert("An unexpected error occurred");
//   }
// };
// handleSubmitIndents: validation -> prepare payload -> submit -> confirm status
// Steps:
// 1. Validate local rows and prevent duplicates.
// 2. Build `preparedIndents` with the shape expected by the backend.
// 3. PUT to `update-or-create-indents` for the lead.
// 4. On success, call `updateStatus(..., "Pending")` which shows the
//    confirmation dialog first and then updates status. Finally refresh list.
const handleSubmitIndents = async () => {
  if (!selectedRe || !editableIndents.length) return;

// ✅ Duplicate check before sending 
const seen = new Set(); 
for (let indent of editableIndents) { 
  if (!indent.asset_name || !indent.uom)
     continue; 
    const key = `${indent.asset_name.trim().toLowerCase()}-${indent.uom.trim().toLowerCase()}`;
     if (seen.has(key)) { 
      alert(`Duplicate indent detected: ${indent.asset_name} (${indent.uom})`); 
      return; 
    }
       seen.add(key);
       }


  // ✅ Keep valid rows
  const preparedIndents = editableIndents
    .filter((indent) => indent.asset_name && indent.quantity)
    .map((indent) => ({
      id: indent.isNew ? null : indent.id,// keep ID if exists
      category: indent.category,
      asset_name: indent.asset_name,
      quantity: indent.quantity,
      uom: indent.uom,
      remarks: indent.remarks,
      workflow_id: indent.workflow_id || null,
      budget: selectedRe?.budget_id || null,
      lead_uid: selectedRe?.lead_uid || null,
      request_for: indent.request_for || null,
      reference_number: selectedRe?.reference_number || null,
      requirement_document_name: "Auto Document",
      document_upload_link: null,
    }));

  try {
    const token = sessionStorage.getItem("token");

    const response = await fetch(
      `${baseUrl}/salesmanagement/indent/update-or-create-indents/${selectedRe.lead_id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedRe?.user_id,
          customer_id: selectedRe.customer_id,
          customer_uid: selectedRe.customer_uid || null,
          indents: preparedIndents,
        }),
      }
    );

    const result = await response.json();

      if (response.ok) {
      console.log("Success:", result);
      // After saving indents, ask for confirmation to change status then show success inside updateStatus
      try {
        await updateStatus(selectedRe.reference_number, "Pending");
      } catch (err) {
        console.error("Failed to update status after indents submission:", err);
        // still close modal so user isn't stuck
        closeModal();
        return;
      }
      // close the resubmit modal after process
      closeModal();
      // Refresh list so updated indents/status appear without page reload
      try {
        await fetchData();
      } catch (err) {
        console.warn("Failed to refresh data after submit:", err);
      }
    } else {
      console.error("Failed:", result);
      alert(result.message || "Submission failed");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("An unexpected error occurred");
  }
};





  // fetchData: central loader for requirement documents
  // Extracted to top-level so it can be reused by submit/status handlers
  // to refresh the UI after successful writes without a full reload.
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token"); // if needed
      const res = await axios.get(
        `${baseUrl}/salesmanagement/indent/retrive-docindent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error("API fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //Api for approve/reject
  const updateStatus = async (docId, status, reason = "", skipConfirm = false, silent = false) => {
    if (status === "Rejected") {
      setSelectedDoc(null); // Close any open modal first
      setTimeout(() => {
        setRejectingDocId(docId);
        setShowRejectModal(true);
      }, 100);
      return;
    }

    // Show confirmation dialog first for non-reject actions (unless skipped)
    if (!skipConfirm) {
      const confirmed = await showCustomAlert({
        type: "confirm",
        title: "Quotation Indent request ?",
        message: `Are you sure you want to ${status.toLowerCase()} this Indent request?`,
        showCancel: true,
        confirmText: "Confirm",
        cancelText: "Cancel",
      });

      if (!confirmed) return; // user cancelled
    }

    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${baseUrl}/salesmanagement/indent/status/by-document/${docId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ Update local state instantly without refetch
      setData((prev) =>
        prev.map((doc) =>
          doc.reference_number === docId ? { ...doc, status } : doc
        )
      );

      setSelectedDoc(null); // close modal
      if (!silent) {
        await showCustomAlert({
          type: "success",
          title: "Success",
          message: `Indent ${status} successfully!`,
          showCancel: false,
          confirmText: "Continue",
        });
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update status");
    }
  };

  // Flatten requirement docs for table
  const rows = data.map((doc) => ({
    ...doc,
    date: new Date(doc.created_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));

  // Filter rows by search and date
  const filteredRows = rows.filter((row) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      row.reference_number?.toString().toLowerCase().includes(query) ||
      row.vendor_name?.toLowerCase().includes(query) ||
      row.requirement_document_name?.toLowerCase().includes(query);
    const docDate = new Date(row.created_at);
    const inStart = !startDate || docDate >= new Date(startDate);
    const inEnd = !endDate || docDate <= new Date(endDate);
    return matchesSearch && inStart && inEnd;
  });

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRows = filteredRows.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));

  const handleRejectSubmit = async (reason) => {
    if (!rejectingDocId) return;
    
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${baseUrl}/salesmanagement/indent/status/by-document/${rejectingDocId}`,
        { status: "Rejected", reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      setData((prev) =>
        prev.map((doc) =>
          doc.reference_number === rejectingDocId ? 
          { ...doc, status: "Rejected", rejection_reason: reason } : 
          doc
        )
      );

      setSelectedDoc(null);
      setShowRejectModal(false);
      setRejectingDocId(null);
      
      // Show success message
      await showCustomAlert({
        type: "success",
        title: "Success",
        message: "Indent rejected successfully!",
        showCancel: false,
        confirmText: "Continue",
      });
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      {/* Reject Modal - Moved to top level */}
      {showRejectModal && (
        <RejectModal
          onClose={() => {
            setShowRejectModal(false);
            setRejectingDocId(null);
          }}
          onSubmit={handleRejectSubmit}
        />
      )}
      
      <div className="flex flex-col">
        <div className="flex gap-2 items-center mb-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-md pl-10 pr-4 h-12 py-2 w-[250px]"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                />
              </svg>
            </span>
          </div>

          {/* Date Range Filter */}
          <div className="flex justify-center bg-white items-center m-3 h-12 border rounded-md">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 sm:w-30 rounded-2xl"
            />
            <span className="text-gray-600 px-2">TO</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 sm:w-30 rounded-2xl"
            />
          </div>

          <button
            onClick={() => {
              setSearchQuery("");
              setStartDate("");
              setEndDate("");
              setCurrentPage(1);
            }}
            className="bg-gray-200 text-black px-4 py-2 h-12 rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>

        {/* Table */}
        <div className="flex flex-col">
          {loading ? (
            <p className="p-4">Loading...</p>
          ) : (
            <LeadsTable
              columns={[
                { key: 'sno', label: 'S. No.', render: (_, idx) => `${indexOfFirst + idx + 1}.`, cellClass: 'font-medium text-gray-700' },
                { key: 'date', label: 'Date', render: (r) => r.date || '-' },
                { key: 'lead_uid', label: 'Lead ID', render: (r) => r.lead_uid || '-' },
                { key: 'customer_uid', label: 'Customer UID', render: (r) => r.customer_uid || r.customer_id || '-' },
                {
                  key: 'customer_name', 
                  label: 'Customer Name', 
                  render: (r) => {
                    const name = r.customer_name || '-';
                    const isExpanded = expandedRow === `customer_${r.lead_uid}`;
                    return (
                      <div className="text-center whitespace-normal break-words max-w-[150px] mx-auto">
                        {isExpanded ? name : (name.length > 20 ? `${name.slice(0, 20)}...` : name)}
                        {name.length > 20 && (
                          <button
                            className="ml-2 text-blue-600 font-medium hover:text-blue-800"
                            onClick={() => setExpandedRow(isExpanded ? null : `customer_${r.lead_uid}`)}
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    );
                  },
                  cellClass: 'text-center whitespace-normal',
                },
                { key: 'requirement_document_name', label: 'Requirement Doc.', render: (r) => r.requirement_document_name || '-' },
                { key: 'status', label: 'Status', render: (r) => {
                  let statusColor = 'bg-orange-100 text-orange-800';
                  if (r.status === 'Approved') statusColor = 'bg-green-100 text-green-800';
                  else if (r.status === 'Rejected') statusColor = 'bg-red-100 text-red-800';
                  else if (r.status === 'Resubmitted') statusColor = 'bg-yellow-100 text-yellow-800';
                  
                  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>{r.status === 'Resubmitted' ? 'Resubmit' : r.status}</span>;
                }}
              ]}
              data={currentRows}
              indexOffset={indexOfFirst}
              rowKey={(r, i) => r.id || i}
              actionsRenderer={({ row }) => (
                <div className="flex items-center justify-center gap-3">
                  {row.status !== 'Resubmitted' && (
                    <button
                      className="text-gray-600 hover:text-blue-600"
                      onClick={() => setSelectedDoc(row)}
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                  )}

                  {row.status === 'Resubmitted' && (
                    <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => setSelectedRe(row)}
                      className="text-blue-600 cursor-pointer hover:text-blue-800"
                      title="Edit"
                    />
                  )}
                </div>
              )}
              page={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              visibleRowsPerPage={6}
            />
          )}
        </div>

        {/* Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
            <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 rounded-lg shadow-lg relative z-50 max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center border-b p-4">
                <h2 className="text-lg font-semibold">Details</h2>
                <button onClick={() => setSelectedDoc(null)}>
                  <X size={22} className="text-gray-600 hover:text-red-500" />
                </button>
              </div>

              {/* Info */}
              <div className="bg-gray-100 rounded-md p-4 text-sm mb-2">
                <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                  <p><strong>Lead ID:</strong> {selectedDoc.lead_uid}</p>
                  <p><strong>Customer UID:</strong> {selectedDoc.customer_uid || selectedDoc.customer_id}</p>
                  <p className="text-center"><strong>Customer Name:</strong> {selectedDoc.customer_name}</p>
                  <p><strong>Require Doc Name:</strong> {selectedDoc.requirement_document_name}</p>
                  <p><strong>Query No:</strong> {selectedDoc.reference_number}</p>
                  <p><strong>Description:</strong> {selectedDoc.remarks || "—"}</p>
                  <p><strong>Budget ID:</strong> {selectedDoc.budget_id || "—"}</p>
                  <p><strong>Indent ID:</strong> {selectedDoc.indent_id || "—"}</p>
                </div>
              </div>

              {/* File
            {selectedDoc.document_upload_link && (
              <div className="px-4 pb-2">
                <a
                  href={selectedDoc.document_upload_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 border rounded-md w-fit bg-gray-100"
                >
                  📄 View Document
                </a>
              </div>
            )} */}

              {/* Indents Table */}
              <div className="overflow-auto bg-white min-h-0 max-h-[400px]">
                <table className="min-w-full text-sm">
                  <thead className="h-[70px] sticky top-0 bg-white border-b-black border-b-2 z-10">
                    <tr>
                      <th className="py-2 px-4 border-b text-center">Request For</th>
                      <th className="py-2 px-4 border-b text-center">
                        Item Category
                      </th>
                      <th className="py-2 px-4 border-b text-center">Item</th>
                      <th className="py-2 px-4 border-b text-center">
                        Quantity
                      </th>
                      <th className="py-2 px-4 border-b text-center">UOM</th>
                      {/* <th className="py-2 px-4 border-b text-center">Budget</th> */}
                      <th className="py-2 px-4 border-b text-center">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDoc.indents?.map((indent, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-center align-middle">
                          {indent.request_for}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {indent.category}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {indent.asset_name}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {indent.quantity}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {indent.uom}
                        </td>
                        {/* <td className="p-3 text-center align-middle">
                          ₹{indent.budget || "0.00"}
                        </td> */}
                        <td className="p-3 text-center align-middle">
                          {indent.remarks || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t p-4">
                 <button
                  onClick={() =>
                    updateStatus(selectedDoc.reference_number, "Resubmitted")
                  }
                  className="bg-yellow-500 text-white px-6 py-2 rounded-md"
                >
                  Resubmit
                </button>
                <button
                  onClick={() =>
                    updateStatus(selectedDoc.reference_number, "Rejected")
                  }
                  className="bg-red-500 text-white px-6 py-2 rounded-md"
                >
                  Reject
                </button>
                <button
                  onClick={() =>
                    updateStatus(selectedDoc.reference_number, "Approved")
                  }
                  className="bg-blue-600 text-white px-6 py-2 rounded-md"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}


        {/* model 2 resubmit */}
         {selectedRe && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 rounded-lg shadow-lg max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center border-b p-4">
                <h2 className="text-lg font-semibold">Details</h2>
                {/* <button onClick={() => setSelectedRe(null)}> */}
                <button onClick={closeModal}>
                  <X size={22} className="text-gray-600 hover:text-red-500" />
                </button>
              </div>

              {/* Info */}
              <div className="bg-gray-100 rounded-md p-4 text-sm mb-2">
                <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                  <p><strong>Lead ID:</strong> {selectedRe.lead_uid}</p>
                  <p><strong>Customer UID:</strong> {selectedRe.customer_uid || selectedRe.customer_id}</p>
                  <p className="text-center"><strong>Customer Name:</strong> {selectedRe.customer_name}</p>
                  <p><strong>Require Doc Name:</strong> {selectedRe.requirement_document_name}</p>
                  <p><strong>Query No:</strong> {selectedRe.reference_number}</p>
                  <p><strong>Description:</strong> {selectedRe.remarks || "—"}</p>
                  <p><strong>Budget ID:</strong> {selectedRe.budget_id || "—"}</p>
                  <p><strong>Indent ID:</strong> {selectedRe.indent_id || "—"}</p>
                </div>
              </div>

              {/* File
            {selectedDoc.document_upload_link && (
              <div className="px-4 pb-2">
                <a
                  href={selectedDoc.document_upload_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 border rounded-md w-fit bg-gray-100"
                >
                  📄 View Document
                </a>
              </div>
            )} */}

              {/* Indents Table */}
              <div className="overflow-auto bg-white min-h-0 max-h-[400px]">
                <table className="min-w-full text-sm">
                  <thead className="h-[70px] sticky top-0 bg-white border-b-black border-b-2 z-10">
                    <tr>
                      <th className="py-2 px-4 border-b text-center">Request For</th>
                      <th className="py-2 px-4 border-b text-center">
                        Item Category
                      </th>
                      <th className="py-2 px-4 border-b text-center">Item</th>
                      <th className="py-2 px-4 border-b text-center">
                        Quantity
                      </th>
                      <th className="py-2 px-4 border-b text-center">UOM</th>
                      {/* <th className="py-2 px-4 border-b text-center">Budget</th> */}
                      <th className="py-2 px-4 border-b text-center">
                        Description
                      </th>
                      <th className="py-2 px-4 border-b text-center">Action</th>

                    </tr>
                  </thead>
                  {/* <tbody>
                    {selectedRe.indents?.map((indent, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-center align-middle">
                          {indent.request_for}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {indent.category}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {indent.asset_name}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {indent.quantity}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {indent.uom}
                        </td>
                    
                        <td className="p-3 text-center align-middle">
                          {indent.remarks || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody> */}
                <tbody>
  {editableIndents.map((indent, idx) => (
    <tr key={idx}>
      {/* Request For */}
      <td className="p-3 text-center align-middle">
        {indent.request_for}
      </td>

      {/* Category */}
      <td className="p-3 text-center align-middle">
        {editingIndex === idx ? (
          <input
            value={indent.category}
            onChange={(e) =>
              handleIndentChange(idx, "category", e.target.value)
            }
            className="border p-1 w-full text-center"
          />
        ) : (
          indent.category
        )}
      </td>

      {/* Item */}
      <td className="p-3 text-center align-middle">
        {editingIndex === idx ? (
          <input
            value={indent.asset_name}
            onChange={(e) =>
              handleIndentChange(idx, "asset_name", e.target.value)
            }
            className="border p-1 w-full text-center"
          />
        ) : (
          indent.asset_name
        )}
      </td>

      {/* Quantity */}
      <td className="p-3 text-center align-middle">
        {editingIndex === idx ? (
          <input
            type="number"
            value={indent.quantity}
            onChange={(e) =>
              handleIndentChange(idx, "quantity", e.target.value)
            }
            className="border p-1 w-full text-center"
          />
        ) : (
          indent.quantity
        )}
      </td>

      {/* UOM */}
      <td className="p-3 text-center align-middle">
        {editingIndex === idx ? (
          <input
            value={indent.uom}
            onChange={(e) => handleIndentChange(idx, "uom", e.target.value)}
            className="border p-1 w-full text-center"
          />
        ) : (
          indent.uom
        )}
      </td>

      {/* Description */}
      <td className="p-3 text-center align-middle">
        {editingIndex === idx ? (
          <input
            value={indent.remarks}
            onChange={(e) =>
              handleIndentChange(idx, "remarks", e.target.value)
            }
            className="border p-1 w-full text-center"
          />
        ) : (
          indent.remarks || "—"
        )}
      </td>

      {/* Action Buttons */}
      {/* <td className="p-3 text-center align-middle">
        {editingIndex === idx ? (
          <>
            <button
              onClick={() => setEditingIndex(null)} // Save and exit edit mode
              className="text-green-600 hover:underline mr-2"
            >
              Save
            </button>
            <button
              onClick={() => setEditingIndex(null)} // Discard changes if needed
              className="text-red-600 hover:underline"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditingIndex(idx)}
            className="text-blue-600 hover:underline"
          >
            Edit
          </button>
        )}
      </td> */}
      <td className="p-3 text-center align-middle space-x-2">
  {editingIndex === idx ? (
    <>
      {/* ✅ Save */}
      <button
        onClick={() => setEditingIndex(null)}
        className="text-green-600 hover:text-green-800"
        title="Save"
      >
        Save
      </button>

      {/* ✅ Cancel */}
      <button
        onClick={() => setEditingIndex(null)}
        className="text-gray-600 hover:text-red-500"
        title="Cancel"
      >
        Cancel
      </button>
    </>
  ) : (
    <>
      {/* ✏️ Edit Icon */}
      <button
        onClick={() => setEditingIndex(idx)}
        className="text-blue-600 hover:text-blue-800"
        title="Edit"
      >
        <FontAwesomeIcon icon={faEdit} />
      </button>

      {/* 🗑️ Remove Icon for New Indents Only */}
          {indent.isNew && (
        <button
          onClick={() => removeIndent(idx)}
          className="text-red-600 hover:text-red-800"
          title="Remove"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}

    </>
  )}
</td>

    </tr>
  ))}
</tbody>


                </table>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t p-4">
                <button
                    onClick={addNewIndent}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md"
                  >
                    Add Item
                  </button>
                  <button
                      onClick={handleSubmitIndents}
                      className="bg-green-600 text-white px-6 py-2 rounded-md"
                    >
                      Submit For Approval
                    </button>

                {/* <button
                  onClick={() =>
                    updateStatus(selectedRe.reference_number, "Approved")
                  }
                  className="bg-green-600 text-white px-6 py-2 rounded-md"
                >
                 Send to Approve
                </button> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default IndentApproval;
