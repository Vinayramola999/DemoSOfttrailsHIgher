import React, { useState, useEffect } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { X } from "lucide-react";
import TableFilters from "./components/TableFilters";
import LeadsTable from "./components/LeadsTable";
import { exportToExcel, exportToPDF } from "./components/ExportUtils";

const baseUrl = process.env.REACT_APP_URL_sales || '';

const SetupLeadCategory = () => {
  const [formData, setFormData] = useState({ leadCategory: "", subCategory: "", description: "" });
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ leadValidity: "", renewableBuffer: "" });
  const [storedLeadValidity, setStoredLeadValidity] = useState(90);

  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Fetch list of lead categories
  const fetchLeads = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${baseUrl}/salesmanagement/leads/retrive-leadtype`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.data && res.data.success) {
        const mappedData = res.data.leads.map((item) => ({
          id: item.id,
          leadCategory: item.lead_category,
          subCategory: item.sub_category,
          activeDuration: item.active_duration,
          description: item.description || "-",
          date: item.created_time ? new Date(item.created_time).toISOString().split("T")[0] : "",
          displayDate: item.created_time ? new Date(item.created_time).toLocaleDateString("en-GB") : "",
          renewDate: item.renew_date,
          status: item.status || "",
        }));
        setData(mappedData);
      }
    } catch (err) {
      console.error("Error fetching lead categories:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Settings: fetch current validity
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`${baseUrl}/salesmanagement/leads/lead-validity/current`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.data && res.data.success) {
          const leadValidityDays = res.data.data?.lead_validity_days ?? 90;
          const renewDay = res.data.data?.renew_day ?? "";
          setStoredLeadValidity(leadValidityDays);
          // populate settings inputs so the modal shows the current values
          setSettings({ leadValidity: leadValidityDays?.toString(), renewableBuffer: renewDay?.toString() });
        }
      } catch (err) {
        // ignore
      }
    };
    fetchSettings();
  }, []);

  const toggleReadMore = (id) => setExpandedRow(expandedRow === id ? null : id);

  // Filters helper instance
  const filters = TableFilters({ searchQuery, setSearchQuery, startDate, setStartDate, endDate, setEndDate });
  const filteredData = filters.filterData(data, ["leadCategory", "subCategory", "description", "date"]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Submit new lead category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leadCategory || !formData.description) return setError("Please fill required fields");
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        `${baseUrl}/salesmanagement/leads/lead-type`,
        {
          lead_type: formData.leadCategory,
          sub_category: formData.subCategory,
          activeduration: storedLeadValidity,
          description: formData.description,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data && res.data.success) {
        await fetchLeads();
        setFormData({ leadCategory: "", subCategory: "", description: "" });
        setShowModal(false);
      } else {
        alert(res.data?.message || "Failed to add lead category");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add lead category");
    }
  };

  const handleSettingsSave = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!settings.leadValidity || !settings.renewableBuffer) return alert("Fill both fields");
      const res = await axios.post(
        `${baseUrl}/salesmanagement/leads/lead-validity`,
        { lead_validity_days: parseInt(settings.leadValidity), renewDay: parseInt(settings.renewableBuffer) },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data && res.data.success) {
        setStoredLeadValidity(parseInt(settings.leadValidity));
        setShowSettings(false);
      } else {
        alert(res.data?.message || "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    }
  };

  // Exports
  const handleExportExcel = () => {
    const headers = ["S.No.", "Lead Category", "Sub Category", "Date", "Description", "Status"];
    exportToExcel(
      filteredData,
      headers,
      (item, idx) => [idx + 1, item.leadCategory, item.subCategory || "-", item.displayDate || item.date, item.description, item.status],
      `lead_categories_${new Date().toISOString().slice(0,10)}.csv`
    );
  };

  const handleExportPDF = () => {
    const headers = ["S.No.", "Lead Category", "Sub Category", "Date", "Description", "Status"];
    exportToPDF(
      filteredData,
      headers,
      (item, idx) => [idx + 1, item.leadCategory, item.subCategory || "-", item.displayDate || item.date, item.description, item.status],
      `lead_categories_${new Date().toISOString().slice(0,10)}.pdf`,
      "Lead Categories Report"
    );
  };

  return (
    <div className="min-h-screen p-4 bg-[#FAFAF6]">
      <div className="flex items-center justify-between mb-4">
        <button className="bg-[#005BE7] text-white px-4 py-2 rounded-md" onClick={() => setShowModal(true)}>
          + Setup Lead Category
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowSettings(false)} />
          <div className="relative bg-white w-[400px] rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm">Lead Validity (days)</label>
                <input type="number" min="1" value={settings.leadValidity} onChange={(e) => setSettings({ ...settings, leadValidity: e.target.value })} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm">Renewable Buffer (days)</label>
                <input type="number" min="1" value={settings.renewableBuffer} onChange={(e) => setSettings({ ...settings, renewableBuffer: e.target.value })} className="w-full border rounded px-2 py-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowSettings(false)} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={handleSettingsSave} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Lead Category */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-[540px] rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Setup Lead Category</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm">Lead Category</label>
                <input value={formData.leadCategory} onChange={(e) => setFormData({ ...formData, leadCategory: e.target.value })} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm">Sub Category</label>
                <input value={formData.subCategory} onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters UI with icons aligned to the right (placed next to filters) */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">{filters.renderFilters()}</div>
        <div className="flex items-center gap-2 ml-2 mt-1">
          {(function(){
            const excelIcon = encodeURI('/vscode-icons_file-type-excel2.png');
            const pdfIcon = encodeURI('/material-icon-theme_pdf (1).png');
            const settingsIcon = encodeURI('/Group 4053.png');
            return (
              <>
                <button onClick={handleExportExcel} title="Export to Excel" className="px-1 py-1 bg-transparent rounded hover:bg-gray-100">
                  <img src={excelIcon} alt="Excel" className="w-[59px] h-[24px] object-contain" />
                </button>
                <button onClick={handleExportPDF} title="Export to PDF" className="px-1 py-1 bg-transparent rounded hover:bg-gray-100">
                  <img src={pdfIcon} alt="PDF" className="w-[59px] h-[24px] object-contain" />
                </button>
                <button onClick={() => setShowSettings(true)} title="Settings" className="px-1 py-1 bg-transparent rounded hover:bg-gray-100">
                  <img src={settingsIcon} alt="Settings" className="w-[59px] h-[24px] object-contain" />
                </button>
              </>
            );
          })()}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white mt-4 border rounded">
        <LeadsTable
          columns={[
            { key: 'sno', label: 'S. No.', render: (_, idx) => `${(currentPage - 1) * rowsPerPage + idx + 1}.`, cellClass: 'font-medium text-gray-700' },
            { key: 'leadCategory', label: 'Lead Category', render: (r) => r.leadCategory },
            { key: 'subCategory', label: 'Sub Category', render: (r) => r.subCategory || '-' },
            { key: 'date', label: 'Created Date', render: (r) => r.displayDate || r.date },
            { key: 'description', label: 'Description', render: (r) => {
              const isExpanded = expandedRow === r.id;
              return (
                <div className="text-center max-w-[300px] break-words whitespace-normal mx-auto">
                  {isExpanded ? r.description : (r.description?.length > 50 ? `${r.description.slice(0, 50)}...` : r.description)}
                  {r.description && r.description.length > 50 && (
                    <button 
                      className="ml-2 text-blue-600 font-medium" 
                      onClick={() => toggleReadMore(r.id)}
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              );
            }, cellClass: 'text-center whitespace-normal'},
            { key: 'activeDuration', label: 'Active Duration', render: (r) => r.activeDuration || '-' }
          ]}
          data={paginatedData}
          indexOffset={(currentPage - 1) * rowsPerPage}
          rowKey={(r) => r.id}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
          visibleRowsPerPage={5}
        />
      </div>
    </div>
  );
};

export default SetupLeadCategory;

