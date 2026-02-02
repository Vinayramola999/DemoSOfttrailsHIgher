import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import API from "../config/api";
import Quotation from "./rfpTabs/Quotation";
import ShortlistedQuotation from "./rfpTabs/ShortlistedQuotation";
import PurchaseOrder from "./rfpTabs/PurchaseOrder";
import Supplies from "./rfpTabs/Supplies";
import PopupModal from "./PopupModal";
import RFPShared from "./rfpTabs/RFPShared";
import Grn from "./GRN/Grn";

const PurchaseProcess = ({ onClose, selectedContacts }) => {
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const [indentId, setIndentId] = useState("");
  const [requestFor, setRequestFor] = useState("");
  const [category, setCategory] = useState("");
  const [requestAsset, setRequestAsset] = useState("");
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("RFP");
  const [indentOptions, setIndentOptions] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showSendOptions, setShowSendOptions] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [showAllSuppliers, setShowAllSuppliers] = useState(false);
  const searchLower = search.toLowerCase();
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    type: "success",
    title: "",
    message: "",
  });
  const [indentItems, setIndentItems] = useState([]); // items for selected RFP

  const sortedData = [...data].sort((a, b) =>
    a.contact_person.localeCompare(b.contact_person),
  );

  const filteredData = [
    // Always show selected contacts first (no duplicates)
    ...sortedData.filter((item) => selected.includes(item.email_id)),
    // Then show other contacts matching the search, excluding already selected
    ...sortedData.filter(
      (item) =>
        !selected.includes(item.email_id) &&
        (item.contact_person?.toLowerCase().includes(searchLower) ||
          item.email_id?.toLowerCase().includes(searchLower) ||
          item.phone_num?.toLowerCase().includes(searchLower) ||
          item.asset_name?.toLowerCase().includes(searchLower) ||
          item.status?.toLowerCase().includes(searchLower)),
    ),
  ];
  // ...existing code...
  const handleIndentChange = async (e) => {
    const selectedRfpId = e.target.value;
    setIndentId(selectedRfpId);
    setIndentItems([]); // reset previously loaded items

    if (!selectedRfpId) {
      setRequestFor("");
      setCategory("");
      setRequestAsset("");
      return;
    }

    try {
      const response = await axios.get(
        `${API.PURCHASE_API}/indenting/rfp/${selectedRfpId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = response.data;

      // Support new API shape: { rfp_info: {...}, items: [...] }
      // Fallback to older shape if needed.
      const itemsFromNewShape = Array.isArray(apiData?.items)
        ? apiData.items
        : null;

      const itemsFromOldShape = Array.isArray(apiData?.data?.[0]?.indenting)
        ? apiData.data[0].indenting
        : null;

      const items = itemsFromNewShape || itemsFromOldShape || [];

      setIndentItems(items);

      if (items.length === 1) {
        const it = items[0];
        setRequestFor(it.request_for || "");
        setCategory(it.category || "");
        setRequestAsset(it.asset_name || "");
      } else {
        // multiple or zero items -> clear single inputs (table will show items if more than 1)
        setRequestFor("");
        setCategory("");
        setRequestAsset("");
      }
    } catch (error) {
      console.error("Error fetching RFP details:", error);
      setRequestFor("");
      setCategory("");
      setRequestAsset("");
      setIndentItems([]);
    }
  };

  const handleSelect = (email) => {
    if (selected.includes(email)) {
      setSelected(selected.filter((e) => e !== email));
    } else {
      setSelected([...selected, email]);
    }
  };

  const handleSend = async (e) => {
    if (!Array.isArray(selected) || selected.length === 0) {
      setModalProps({
        type: "warning",
        title: "Warning!",
        message: "Please select at least one contact.",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
      return;
    }

    // Get selectedRfpId from the Select event or from state
    const selectedRfpId = e?.target?.value || indentId;

    try {
      // 1️⃣ Share RFP first (use selectedRfpId)
      await axios.post(
        `${API.PURCHASE_API}/rfps/share_rfp/${selectedRfpId}`,
        { email_id: selected },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const modulesRes = await axios.get(`${API.UCS_API}/api/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const modules = modulesRes.data;
      const productModule = Array.isArray(modules)
        ? modules.find((m) => m.applicationName === "Product Management")
        : null;
      const uniqueIdentifierName =
        productModule?.uniqueIdentifierName || "PM-R-SR";
      // Fetch RFP details
      const rfpRes = await axios.get(
        `${API.PURCHASE_API}/indenting/rfp/${indentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const rfpData = rfpRes.data?.data?.[0];
      const indenting = rfpData?.indenting || {};
      const additionalDescription = rfpData?.additionalDescription || {};

      // Prepare payload
      const firstSelectedEmail = selected[0];
      const selectedContact = data.find(
        (item) => item.email_id === firstSelectedEmail,
      );

      const payload = {
        uniqueIdentifierName,
        contact_person: selectedContact?.contact_person || "Contact Person",
        email_id: selected.join(","),
        rfp_id: indenting.rfp_id || indentId,
        rfp_file_link: additionalDescription.rfp_file_link || "",
        email: firstSelectedEmail || "",
      };

      // Send RFP (UCS)
      const response = await axios.post(`${API.UCS_API}/ucs/send`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (
        response.data === "Sent Successfully" ||
        response.data?.message === "Sent Successfully" ||
        response.data?.success === true
      ) {
        setModalProps({
          type: "success",
          title: "Success!",
          message: "RFP sent successfully.",
          onClose: () => {
            setShowModal(false);
            setSelected([]);
            if (typeof onClose === "function") onClose();
          },
        });
        setShowModal(true);
      } else {
        setModalProps({
          type: "error",
          title: "Error!",
          message: "Failed to send RFP. Please try again.",
          onClose: () => setShowModal(false),
        });
        setShowModal(true);
      }
    } catch (error) {
      setModalProps({
        type: "error",
        title: "Error!",
        message: "Failed to send RFP. Please try again.",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    }
  };

  const tabs = [
    { id: "RFP", label: "RFP" },
    { id: "RfpShared", label: "RFP Shared" },
    { id: "Quotation", label: "Quotation" },
    { id: "Shortlisted Quotation", label: "Shortlisted Quotation" },
    { id: "PurchaseOrder", label: "Purchase Order" },
    { id: "GRN", label: "GRN" },
    // { id: "Supplies", label: "Supplies" },
  ];

  // useEffect(() => {
  //   const fetchIndentData = async () => {
  //     try {
  //       const response = await axios.get(`${API.PURCHASE_API}/indenting/rfp`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       setIndentOptions(response.data);
  //     } catch (error) {
  //       console.error("Error fetching indent data:", error);
  //     }
  //   };

  //   fetchIndentData();
  // }, [token]);

  useEffect(() => {
    const fetchIndentData = async () => {
      try {
        const response = await axios.get(`${API.PURCHASE_API}/rfps/rfp`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Expecting: { data: [{ rfp_id: "RFP20251119-618" }, ...] }
        const rfps = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
        setIndentOptions(rfps);
      } catch (error) {
        console.error("Error fetching RFP data:", error);
        setIndentOptions([]);
      }
    };

    fetchIndentData();
  }, [token]);
  // Fetch contacts when indentId changes
  useEffect(() => {
    if (!indentId) return;

    const fetchSupplierContacts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API.PURCHASE_API}/S_contact/supplier-contacts/rfp/${indentId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const contacts = response.data?.data || [];
        setData(contacts);
      } catch (error) {
        console.error("Error fetching supplier contacts:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierContacts();
  }, [indentId, token]);

  const rfpOptions = indentOptions.map((indent) => ({
    value: indent.rfp_id,
    label: indent.rfp_id,
  }));

  useEffect(() => {
    if (showModal) {
      const fetchSuppliers = async () => {
        try {
          // Fetch both supplier-contacts and suppliers endpoints and merge
          const [contactsRes, suppliersRes] = await Promise.allSettled([
            axios.get(`${API.PURCHASE_API}/S_contact/supplier-contacts`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API.PURCHASE_API}/supplier/suppliers`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const contacts =
            contactsRes.status === "fulfilled"
              ? contactsRes.value.data?.data || contactsRes.value.data || []
              : [];

          const suppliersRaw =
            suppliersRes.status === "fulfilled"
              ? suppliersRes.value.data?.data || suppliersRes.value.data || []
              : [];

          // Normalize supplier records to contact-like shape (keep only entries with an email)
          const normalizedSuppliers = suppliersRaw
            .map((s) => ({
              contact_person:
                s.contact_person ||
                s.name ||
                s.company_name ||
                s.supplier_name ||
                "",
              email_id:
                s.email ||
                s.email_id ||
                s.primary_email ||
                s.contact_email ||
                "",
              phone_num: s.phone || s.phone_num || s.mobile || "",
              asset_name: s.asset_name || "",
              status: s.status || "",
            }))
            .filter((r) => r.email_id); // drop entries without email

          // Merge contacts + suppliers, preferring contact entries and dedupe by email_id  email id for testing at dhan
          const merged = [
            ...contacts,
            ...normalizedSuppliers.filter(
              (ns) => !contacts.some((c) => c.email_id === ns.email_id),
            ),
          ];

          setSuppliers(merged);
        } catch (err) {
          console.error("Error fetching supplier data:", err);
          setSuppliers([]);
        }
      };

      fetchSuppliers();
    }
  }, [showModal, token]);

  const handleToggleSuppliers = async () => {
    if (!showAllSuppliers) {
      // Only fetch when expanding
      setLoadingSuppliers(true);
      try {
        // Reuse same logic: fetch both endpoints and merge
        const [contactsRes, suppliersRes] = await Promise.allSettled([
          axios.get(`${API.PURCHASE_API}/S_contact/supplier-contacts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API.PURCHASE_API}/supplier/suppliers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const contacts =
          contactsRes.status === "fulfilled"
            ? contactsRes.value.data?.data || contactsRes.value.data || []
            : [];

        const suppliersRaw =
          suppliersRes.status === "fulfilled"
            ? suppliersRes.value.data?.data || suppliersRes.value.data || []
            : [];

        const normalizedSuppliers = suppliersRaw
          .map((s) => ({
            contact_person:
              s.contact_person ||
              s.name ||
              s.company_name ||
              s.supplier_name ||
              "",
            email_id:
              s.email || s.email_id || s.primary_email || s.contact_email || "",
            phone_num: s.phone || s.phone_num || s.mobile || "",
            asset_name: s.asset_name || "",
            status: s.status || "",
          }))
          .filter((r) => r.email_id);

        const merged = [
          ...contacts,
          ...normalizedSuppliers.filter(
            (ns) => !contacts.some((c) => c.email_id === ns.email_id),
          ),
        ];

        setSuppliers(merged);
      } catch (err) {
        console.error("Error fetching supplier contacts/suppliers:", err);
        setSuppliers([]);
      } finally {
        setLoadingSuppliers(false);
      }
    }
    setShowAllSuppliers((prev) => !prev);
  };

  const filteredSuppliers = suppliers.filter(
    (item) =>
      item.contact_person?.toLowerCase().includes(searchLower) ||
      item.email_id?.toLowerCase().includes(searchLower) ||
      item.phone_num?.toLowerCase().includes(searchLower) ||
      item.asset_name?.toLowerCase().includes(searchLower) ||
      item.status?.toLowerCase().includes(searchLower),
  );
  const displayData = showAllSuppliers
    ? [
        ...filteredData,
        ...filteredSuppliers.filter(
          (s) => !filteredData.some((f) => f.email_id === s.email_id),
        ),
      ]
    : filteredData;
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // or any number you want
  const totalPages = Math.ceil(displayData.length / rowsPerPage);

  const paginatedData = displayData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [displayData.length, totalPages]);

  return (
    <div className="">
      <div className="p-3 w-full">
        {/* Tabs */}
        <div className="flex space-x-4 p-4 ">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-full font-medium transition 
                ${
                  activeTab === id
                    ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                    : "text-black hover:text-blue-600"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className=" font-sans w-11/12">
          {activeTab === "RFP" && (
            <>
              {/* RFP content inline here */}
              <div className="bg-white p-6 rounded-md  font-sans w-11/12">
                <h2 className=" flex justify-start text-lg font-semibold mb-4">
                  Preview/RFP Share{" "}
                </h2>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      RFP ID
                    </label>
                    <div className="w-3/4">
                      <Select
                        options={rfpOptions}
                        value={
                          rfpOptions.find((opt) => opt.value === indentId) ||
                          null
                        }
                        onChange={(opt) =>
                          handleIndentChange({
                            target: { value: opt?.value || "" },
                          })
                        }
                        placeholder="Select"
                        isClearable
                        className="bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* MULTIPLE ITEMS TABLE */}
                  {Array.isArray(indentItems) && indentItems.length > 1 ? (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Items in RFP
                      </label>
                      <div className="overflow-x-auto bg-white border rounded">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2 text-left">Request For</th>
                              <th className="p-2 text-left">Category</th>
                              <th className="p-2 text-left">Material</th>
                            </tr>
                          </thead>
                          <tbody>
                            {indentItems.map((it, i) => (
                              <tr key={i} className="border-t">
                                <td className="p-2">{it.request_for || "-"}</td>
                                <td className="p-2">{it.category || "-"}</td>
                                <td className="p-2">{it.asset_name || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Request for
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={requestFor}
                          className="w-3/4 p-2 border rounded bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={category}
                          className="w-3/4 p-2 border rounded bg-gray-100"
                        />
                      </div>
                    </>
                  )}
                </div>

                {!(Array.isArray(indentItems) && indentItems.length > 1) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Request asset
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={requestAsset}
                      className="w-1/4 p-2 border rounded bg-gray-100"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center mb-2">
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-1/4 p-2 rounded-lg border border-blue-300 bg-blue-50 text-black focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
                  />
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full border border-collapse text-sm mb-6 min-w-[700px]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left w-10">
                          <input
                            type="checkbox"
                            checked={
                              displayData.length > 0 &&
                              selected.length === displayData.length
                            }
                            onChange={(e) =>
                              setSelected(
                                e.target.checked
                                  ? displayData.map((item) => item.email_id)
                                  : [],
                              )
                            }
                          />
                        </th>
                        <th className="p-2 text-left">Contact Person</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Phone</th>
                        <th className="p-2 text-left">Asset</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading || loadingSuppliers ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="p-4 text-center text-gray-500"
                          >
                            Loading...
                          </td>
                        </tr>
                      ) : paginatedData.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="p-4 text-center text-gray-500"
                          >
                            No contacts found related to your asset.
                            <br />
                            You can view other suppliers by clicking on View
                            More.{" "}
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((item, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={selected.includes(item.email_id)}
                                onChange={() => handleSelect(item.email_id)}
                              />
                            </td>
                            <td className="p-2">{item.contact_person}</td>
                            <td className="p-2">{item.email_id}</td>
                            <td className="p-2">{item.phone_num}</td>
                            <td className="p-2">{item.asset_name}</td>
                            <td className="p-2 capitalize">{item.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <button
                      className="w-10 h-10 rounded border bg-[#FAFAF5] flex items-center justify-center disabled:opacity-50"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>
                    <button className="w-10 h-10 rounded bg-blue-600 text-white font-bold">
                      {currentPage}
                    </button>
                    <span className="mx-1">of</span>
                    <button className="w-10 h-10 rounded border border-blue-600 text-blue-600 font-bold bg-white">
                      {totalPages}
                    </button>
                    <button
                      className="w-10 h-10 rounded border bg-[#FAFAF5] flex items-center justify-center disabled:opacity-50"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <p
                    onClick={handleToggleSuppliers}
                    className="text-blue-600 underline cursor-pointer"
                  >
                    {showAllSuppliers ? "View less" : "View more suppliers"}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    className="bg-custome-blue w-1/6 text-white px-6 py-2 rounded-lg"
                    onClick={() => setShowSendOptions(true)}
                  >
                    Send RFP
                  </button>
                </div>
              </div>{" "}
              {showSendOptions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg relative">
                    {" "}
                    <button
                      className="absolute top-2 right-2 text-red-600 text-2xl"
                      onClick={() => setShowSendOptions(false)}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
                      How would you like to send the RFP?
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Would you like to send the RFP automatically using the RFP
                      ID, or upload the document manually?
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
                        onClick={() => {
                          setShowSendOptions(false); // close the send options popup
                          setShowQuotationModal(true); // show the quotation modal
                        }}
                      >
                        Upload Manually
                      </button>

                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={async () => {
                          setShowSendOptions(false); // close the popup
                          await handleSend(); // call the send API
                        }}
                      >
                        Send Automatically
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {showQuotationModal && (
                <QuotationModal
                  selectedContacts={selected}
                  indentId={indentId}
                  onClose={() => setShowQuotationModal(false)}
                />
              )}
            </>
          )}
          {activeTab === "RfpShared" && <RFPShared />}
          {activeTab === "Quotation" && <Quotation />}
          {activeTab === "Shortlisted Quotation" && <ShortlistedQuotation />}
          {activeTab === "PurchaseOrder" && <PurchaseOrder />}
          {activeTab === "GRN" && <Grn />}
          {activeTab === "Supplies" && <Supplies />}
        </div>
      </div>

      {showModal && (
        <PopupModal
          type={modalProps.type}
          title={modalProps.title}
          message={modalProps.message}
          onClose={modalProps.onClose || (() => setShowModal(false))} // fallback  for the this photoshop at the fndkjvd,
        />
      )}
    </div>
  );
};

export default PurchaseProcess;

const QuotationModal = ({ onClose, indentId, selectedContacts }) => {
  const [deliveryDays, setDeliveryDays] = useState(30);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-[500px] shadow-md relative">
        <button
          className="absolute top-2 right-2 text-red-600 text-xl"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="flex flex-start text-lg font-semibold mb-4">
          Quotation
        </h2>

        <label className="block mb-4">
          <span className="text-sm">Delivery time till</span>
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="number"
              className="border rounded px-3 py-1 w-24"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
            />
            <span>Days</span>
          </div>
        </label>

        <div className="border-2 border-dashed rounded-md p-4 text-center mb-4">
          <p>Choose a file or drag & drop it here.</p>
          <p className="text-sm text-gray-500">
            JPEG, PNG, PDF, and DOX formats, up to 50 MB.
          </p>
          <label className="text-blue-600 underline cursor-pointer block mt-2">
            Browse File
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
          {file && <p className="text-sm text-green-600 mt-2">{file.name}</p>}
        </div>

        <div className="mb-4">
          <strong className="block mb-1">Terms and conditions</strong>
          <p className="text-sm text-gray-600">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry...
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            // onClick={handleSend}
          >
            Send
          </button>

          <button className="border px-4 py-2 rounded" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
