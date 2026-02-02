import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showCustomAlert } from "./components/CustomAlert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
// IoIosCloseCircle moved into LeadDetailsModal component
import AddLeadModal from "./components/AddLeadModal";
import LeadDetailsModal from "./components/LeadDetailsModal";
import LeadsTable from "./components/LeadsTable";
import { exportToExcel, exportToPDF } from "./components/ExportUtils";
import KAMDetailsPopup from "./components/KAMDetailsPopup";

import "./components/Modal.css";

// Base URL for sales APIs (can be overridden with REACT_APP_URL_sales)
// Default to empty string so requests become relative (e.g. /salesmanagement/...)
const baseUrl = process.env.REACT_APP_URL_sales || '';
const baseUrlc = process.env.REACT_APP_URL_crm || ''; 
const baseUrlu = process.env.REACT_APP_URL_users || ''; 

/* eslint-disable no-unused-vars */

export default function QueryAndLeads() {
  const [missingFields, setMissingFields] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startDates, setStartDates] = useState("");
  const [newstartDate, setNewStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [source, setSource] = useState("Sales");
  const [kam, setKam] = useState("");
  const [remark, setRemark] = useState("");
  // `leead` holds the selected lead category from the Select control
  const [leead, setLeead] = useState("");
  const [Leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeadData, setSelectedLeadData] = useState(null);
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [queries, setQueries] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [leadOptions, setLeadOptions] = useState([]); // ✅ always start with empty array
  const [leadTypeOptions, setLeadTypeOptions] = useState([]); // for dropdown
  const [editedKAM, setEditedKAM] = useState("");
  const [kamUsers, setKamUsers] = useState([]);
  const [modalMode, setModalMode] = useState(""); // "edit" or "verify"
  const [showKAMDetails, setShowKAMDetails] = useState(false);
  const [selectedKAMData, setSelectedKAMData] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // Reset pagination when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate]);

  // Fetch data from API
  useEffect(() => {
    if (!selectedCustomerId) return;

    const customer = customers.find(
      (c) => String(c.customer_uid || c.customer_id) === String(selectedCustomerId)
    );

    if (customer) {
      const formattedDate = customer.created_at
        ? new Date(customer.created_at).toISOString().split("T")[0]
        : "";

      setSource(customer.source || "");
      setRemark(customer.reason || ""); // Use reason field from new API
      // ... add other fields like GST, address, etc.
    }
  }, [selectedCustomerId, customers]);

  // Fetch queries from API to get customer IDs
  useEffect(() => {
    const fetchCustomers = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        navigate("/");
        return;
      }

      try {
        console.log("Token ➕", token);
        const response = await axios.get(`${baseUrlc}/customers/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Extract customers from nested data structure
        const customersData = Array.isArray(response.data)
          ? response.data
          : response.data.data?.customers || response.data.queries || [];

        const sortedData = customersData.sort((a, b) => {
          // Sort by customer_uid if available, otherwise by customer_id
          const uidA = a.customer_uid || a.customer_Id || 0;
          const uidB = b.customer_uid || b.customer_Id || 0;
          return String(uidA).localeCompare(String(uidB));
        });

        setCustomers(sortedData);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };

    fetchCustomers();
  }, [navigate]);

  // Get today's date in YYYY-MM-DD format
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDates(today);
  }, []);

  // Fetch users from API
  useEffect(() => {
    const fetchKAMUsers = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${baseUrlu}/users/getusers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const users = Array.isArray(res.data) ? res.data : res.data.users || [];
        setKamUsers(users);
      } catch (err) {
        console.error("Failed to fetch KAM users", err);
      }
    };

    fetchKAMUsers();
  }, []);

  // Handler for showing KAM details
  const handleShowKAMDetails = (kamId) => {
    const kamData = kamUsers.find((user) => user.user_id === kamId);
    if (kamData) {
      setSelectedKAMData(kamData);
      setShowKAMDetails(true);
    } else {
      console.log("KAM not found:", kamId, "Available KAMs:", kamUsers);
    }
  };

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${baseUrl}/salesmanagement/leads/get-leads`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Extract leads array from response (supports both direct array and { leads: [...] })
      const rawLeads = Array.isArray(res.data)
        ? res.data
        : res.data.leads || [];

      // Map incoming payload to the shape expected by the UI
      const mapped = rawLeads.map((item) => ({
        lead_id: item.lead_id,
        lead_uid: item.lead_uid,
        customer_name: item.customer_name,
        customer_id: item.customer_id,
        customer_uid: item.customer_uid || null,
        service: item.service,
        messages: item.messages,
        status: item.status,
        created_at: item.created_at,
        source: item.source,
        query_date: item.query_date,
        assign_to: item.assign_to,
        sub_category: item.sub_category,
        active_days: item.active_days,
        duration_date: item.duration_date,
        renew_date: item.renew_date,
        // backend name -> UI expects kam_name in some places, add for compatibility
        name: item.name,
        kam_name: item.name || item.kam_name || null,
      }));

      setLeads(mapped);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      setLeads([]); // Fallback
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filter queries when customer is selected
  useEffect(() => {
    if (selectedCustomerId) {
      // Resolve selectedCustomerId which may be a UID (e.g. C100035) or numeric id
      let resolvedId = selectedCustomerId;
      if (isNaN(parseInt(resolvedId))) {
        const matched = customers.find(
          (c) => String(c.customer_uid) === String(selectedCustomerId) || String(c.customer_id) === String(selectedCustomerId)
        );
        resolvedId = matched ? matched.customer_id : selectedCustomerId;
      }

      const filtered = queries.filter(
        (q) => q.customer_id === parseInt(resolvedId)
      );
      setFilteredQueries(filtered);

      const uniqueServices = [...new Set(filtered.map((q) => q.service))];
      setLeadOptions(uniqueServices);
    } else {
      setFilteredQueries([]);
      setLeadOptions([]);
    }

    setLeead("");
    setRemark("");
  }, [selectedCustomerId, queries, customers]);

  // verifying leads
  const handleVerifyLead = async (leadId) => {
    const confirm = await showCustomAlert({
      type: "confirm",
      title: "Are you sure?",
      message: "Do you really want to verify this lead?",
      showCancel: true,
      confirmText: "Yes, verify it!",
      cancelText: "Cancel",
    });

    if (confirm) {
      try {
        const token = sessionStorage.getItem("token");

        if (!token || !leadId) {
          await showCustomAlert({ type: "info", title: "Error", message: "Token or Lead ID is missing." });
          return;
        }

        const response = await axios.put(
          `${baseUrl}/salesmanagement/leads/verify-lead/${leadId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await showCustomAlert({ type: "success", title: "Verified!", message: "Lead verified and it will appear in Verified Lead." });
        setShowDetailsModal(false);

        // Optional: Refresh lead list after verifying
        // await fetchLeads();
      } catch (error) {
        console.error("Verification error:", error);
        await showCustomAlert({ type: "info", title: "Failed!", message: "Something went wrong during verification." });
      } finally {
        fetchLeads(); // Refresh leads after verification
      }
    }
  };

  // Auto-fill remark based on selected lead
  useEffect(() => {
    // auto-fill remark when the selected lead category (leead) changes
    if (leead && filteredQueries.length > 0) {
      const match = filteredQueries.find((q) => q.service === leead);
      if (match) {
        setRemark(match.messages || "");
      }
    }
  }, [leead, filteredQueries]);

  // Filtered Leads table data
  const filteredLeads = Leads.filter((lead) => {
    const leadDate = new Date(lead.created_at || lead.date);
    const isAfterStart = startDate ? leadDate >= new Date(startDate) : true;
    const isBeforeEnd = endDate ? leadDate <= new Date(endDate) : true;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (lead.customer_id?.toString() || "")
        .toLowerCase()
        .includes(searchLower) ||
      (lead.messages || "").toLowerCase().includes(searchLower) ||
      (lead.service || "").toLowerCase().includes(searchLower) ||
      (lead.source || "").toLowerCase().includes(searchLower) ||
      (lead.customer_name || "").toLowerCase().includes(searchLower) ||
      (lead.kam_name || "").toLowerCase().includes(searchLower);
    return matchesSearch && isAfterStart && isBeforeEnd;
  });

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRows = filteredLeads.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / itemsPerPage)
  );

  // Fetch lead types for dropdown

  useEffect(() => {
    const fetchLeadTypes = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `${baseUrl}/salesmanagement/leads/retrive-leadtype`,
          {
            headers: { Authorization: token ? `Bearer ${token}` : undefined },
          }
        );
        if (res.data?.success && Array.isArray(res.data.leads)) {
          setLeadTypeOptions(res.data.leads); // ✅ store in new state
        } else {
          setLeadTypeOptions([]);
        }
      } catch (err) {
        console.error("Error fetching lead types:", err);
        setLeadTypeOptions([]);
      }
    };
    fetchLeadTypes();
  }, []);

  // Handle adding leads
  const handleAddleads = async (formData) => {
    setError("");
    // treat missing source as 'Sales' to match UI expectation
    const missing = [];
    if (!formData.customerId) missing.push("customerId");
    if (!formData.lead) missing.push("lead");
    if (!formData.leadCreationDate) missing.push("leadCreationDate");
    if (!formData.source) missing.push("source");
    if (!formData.kam) missing.push("kam");
    if (!formData.remark) missing.push("remark");
    // Debug: log missing fields and current form state so we can see why validation blocks
    console.warn("handleAddleads - missing fields:", missing);
    console.log("handleAddleads - form state:", {
      selectedCustomerId,
      leead,
      newstartDate,
      source,
      remark,
    });
    setMissingFields(missing);
    if (missing.length > 0) {
      setError("All fields are mandatory");
      return;
    }

    // Ask for confirmation before submitting the lead
    const confirm = await showCustomAlert({
      type: "confirm",
      title: "Submit Lead?",
      message: "Are you sure you want to submit lead ?",
      showCancel: true,
      confirmText: "Confirm",
      cancelText: "Cancel",
    });

    if (!confirm) {
      // User cancelled submission
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Token does not exist.");
        return;
      }

      const now = new Date().toISOString();

      // Resolve customer_id: formData.customerId may be a UID (e.g. 'C100035') or numeric id
      let numericCustomerId = parseInt(formData.customerId);
      if (isNaN(numericCustomerId)) {
        const matchedCustomer = customers.find(
          (c) => String(c.customer_uid) === String(formData.customerId) || String(c.customer_id) === String(formData.customerId)
        );
        numericCustomerId = matchedCustomer ? matchedCustomer.customer_id : null;
      }

      if (!numericCustomerId) {
        setError("Could not resolve customer id from selected customer. Please choose a valid customer.");
        return;
      }

      const payload = {
        customer_id: Number(numericCustomerId),
        customer_uid: formData.customerId,
        user_id: parseInt(formData.kam),
        service: formData.lead,
        messages: formData.remark,
        assigned_to: parseInt(formData.kam),
        created_at: formData.leadCreationDate
          ? `${formData.leadCreationDate} 00:00:00`
          : now.split(".")[0],
        source: formData.source || "Sales",
        query_date: now,
        active_days: formData.active_days || "90",
        renew_day: formData.renew_day || "10",
        sub_category: formData.subCategory || "",
      };

      const response = await axios.post(
        `${baseUrl}/salesmanagement/leads/create-query-withleads`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;

      if (response.data.success || response.data.message) {
        setError("");
        // Find customer UID and name for display
        const dispCustomer = customers.find(c => Number(c.customer_id) === Number(payload.customer_id));
        const dispUid = dispCustomer ? (dispCustomer.customer_uid || dispCustomer.customer_id) : payload.customer_id;

        await showCustomAlert({
          type: "success",
          title: "Lead Created Successfully",
          message: `Customer: ${dispUid} (${dispCustomer ? dispCustomer.customer_name : ''})\nService: ${payload.service}\nSub Category: ${payload.sub_category || "N/A"}\nSource: ${payload.source}\nMessages: ${payload.messages}\nActive Days: ${payload.active_days}`,
          confirmText: "OK",
        });
        setShowModal(false);
        resetForm();
        fetchLeads(); // Refresh the leads list
      } else {
        setError(
          response.data.message || "Failed to create lead. Please try again."
        );
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      fetchLeads(); // Refresh leads after adding
    }
  };

  const resetForm = () => {
    setSelectedCustomerId("");
    setLeead("");
    setRemark("");
    setSource("");
    setKam("");
    setStartDate("");
    setNewStartDate("");
  };

  // Save changes handler
  const handleSaveKAM = async (leadId) => {
    try {
      const token = sessionStorage.getItem("token");

      if (!editedKAM || !selectedLeadData?.customer_id) {
        await showCustomAlert({ type: "info", title: "Validation Error", message: "Please select a KAM and ensure customer ID is available." });
        return;
      }

      await axios.put(
        `${baseUrl}/salesmanagement/leads/update-KAM/${leadId}`,
        {
          assign_to: Number(editedKAM),
          customer_id: Number(selectedLeadData.customer_id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await showCustomAlert({ type: "success", title: "Success", message: "KAM has been reassigned." });
      setShowDetailsModal(false);
      fetchLeads(); // refresh list
    } catch (error) {
      console.error("Error reassigning KAM:", error);
      await showCustomAlert({ type: "info", title: "Error", message: "Failed to save changes." });
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-full">
        <div className="flex flex-col w-full">
          <button
            className="bg-[#005BE7] w-[183px] text-white px-4 py-2 h-12 rounded-md"
            onClick={() => setShowModal(true)}
          >
            + Add Leads
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-2 items-center">
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

            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 h-12 rounded-md text-sm font-medium shadow-sm">
              NOTE: All leads pending for verification.
            </div>
          </div>

          {/* Icons for exports */}
          <div className="flex items-center gap-2 ml-2 mt-1">
            {(function(){
              const excelIcon = encodeURI('/vscode-icons_file-type-excel2.png');
              const pdfIcon = encodeURI('/material-icon-theme_pdf (1).png');
              const settingsIcon = encodeURI('/Group 4053.png');
              return (
                <>
                  <button onClick={() => {
                    const headers = ["S.No.", "Customer ID", "Lead", "Lead ID", "Lead Date", "Source", "KAM", "Sub Category", "Status"];
                    exportToExcel(filteredLeads, headers, (item, idx) => [idx+1, item.customer_uid || item.customer_id, item.customer_name, item.lead_uid, item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : '-', item.source, item.name || item.kam_name || '-', item.sub_category || '-', item.status || '-'], `all_leads_${new Date().toISOString().slice(0,10)}.csv`);
                  }} title="Export to Excel" className="px-1 py-1 bg-transparent rounded hover:bg-gray-100">
                    <img src={excelIcon} alt="Excel" className="w-[59px] h-[24px] object-contain" />
                  </button>
                  <button onClick={() => {
                    const headers = ["S.No.", "Customer ID", "Lead", "Lead ID", "Lead Date", "Source", "KAM", "Sub Category", "Status"];
                    exportToPDF(filteredLeads, headers, (item, idx) => [idx+1, item.customer_uid || item.customer_id, item.customer_name, item.lead_uid, item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : '-', item.source, item.name || item.kam_name || '-', item.sub_category || '-', item.status || '-'], `all_leads_${new Date().toISOString().slice(0,10)}.pdf`, 'All Leads Report');
                  }} title="Export to PDF" className="px-1 py-1 bg-transparent rounded hover:bg-gray-100">
                    <img src={pdfIcon} alt="PDF" className="w-[59px] h-[24px] object-contain" />
                  </button>
                </>
              );
            })()}
          </div>
        </div>

        {/* Add Lead Modal */}
        {showModal && (
          <AddLeadModal
            onClose={() => {
              setShowModal(false);
              resetForm();
            }}
            onSubmit={handleAddleads}
            customers={customers}
            leadTypeOptions={leadTypeOptions}
            kamUsers={kamUsers}
          />
        )}
        {/* Table Display (now a reusable component) */}
        <LeadsTable
          columns={[
            {
              key: "sno",
              label: "S.NO.",
              render: (_, idx) => `${idx + 1}.`,
              cellClass: "font-medium text-gray-700",
            },
            {
              key: "customer_name",
              label: "Customer Name",
              headClass: "max-w-[300px]",
              render: (row) => {
                const name = row.customer_name || "-";
                const isExpanded = expandedRow === `customer_${row.lead_id}`;
                return (
                  <div className="text-center whitespace-normal break-words max-w-[300px] mx-auto">
                    {isExpanded ? name : (name.length > 50 ? `${name.slice(0, 50)}...` : name)}
                    {name.length > 50 && (
                      <button
                        className="ml-2 text-blue-600 font-medium hover:text-blue-800"
                        onClick={() => setExpandedRow(isExpanded ? null : `customer_${row.lead_id}`)}
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                );
              },
              cellClass: "text-center",
            },
            {
              key: "service",
              label: "Lead",
               headClass: "max-w-[300px]",
              render: (row) => {
                const service = row.service || "-";
                const isExpanded = expandedRow === `service_${row.lead_id}`;
                return (
                  <span
                    className="text-blue-600 cursor-pointer text-left whitespace-normal break-words max-w-[300px]"
                    onClick={() => {
                      setSelectedLeadData(row);
                      setModalMode("verify");
                      setShowDetailsModal(true);
                    }}
                  >
                    {isExpanded ? service : (service.length > 50 ? `${service.slice(0, 50)}...` : service)}
                    {service.length > 50 && (
                      <button
                        className="ml-2 text-blue-600 font-medium hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRow(isExpanded ? null : `service_${row.lead_id}`);
                        }}
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </span>
                );
              },
              clickable: false,
              cellClass: "text-left",
            },
            {
              key: "sub_category",
              label: "Sub Category",
              render: (row) => row.sub_category || "-",
            },
            { key: "lead_uid", label: "Lead ID" },
            {
              key: "created_at",
              label: "Lead Date",
              render: (r) =>
                r.created_at
                  ? new Date(r.created_at).toLocaleDateString("en-GB")
                  : "-",
            },
            { key: "source", label: "Source" },
            {
              key: "name",
              label: "KAM",
              render: (row) => (
                <span
                  className="text-blue-600 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowKAMDetails(row.assign_to);
                  }}
                >
                  {row.name || "-"}
                </span>
              ),
            },
          ]}
          data={currentRows}
          indexOffset={indexOfFirst}
          rowKey={(r, i) => r.lead_id || i}
          onRowClick={(row) => {
            setSelectedLeadData(row);
            setModalMode("verify");
            setShowDetailsModal(true);
          }}
          actionsRenderer={({ row }) => (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLeadData(row);
                setEditedKAM(row.kam_name || "");
                setModalMode("edit");
                setShowDetailsModal(true);
              }}
            >
              <FontAwesomeIcon
                icon={faEdit}
                className="text-blue-600 cursor-pointer"
              />
            </div>
          )}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
          visibleRowsPerPage={5}
        />

        {/* Details Modal (moved to component) */}
        <LeadDetailsModal
          visible={showDetailsModal}
          selectedLeadData={selectedLeadData}
          modalMode={modalMode}
          onClose={() => setShowDetailsModal(false)}
          onVerify={handleVerifyLead}
          onSave={handleSaveKAM}
          editedKAM={editedKAM}
          setEditedKAM={setEditedKAM}
          kamUsers={kamUsers}
        />

        {/* KAM Details Popup */}
        <KAMDetailsPopup
          isOpen={showKAMDetails}
          onClose={() => setShowKAMDetails(false)}
          kamData={selectedKAMData}
        />
      </div>
    </div>
  );
}
