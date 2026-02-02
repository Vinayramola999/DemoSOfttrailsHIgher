import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../../NewComponents/ConfirmationModal";
import MessageModal from "../../../NewComponents/MessageModal";
import API_BASE_URL from "../../config/api";

const SalesChannel = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState({ name: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [defaultChannel, setDefaultChannel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [salesChannels, setSalesChannels] = useState([]);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [messageModal, setMessageModal] = useState({
    message: "",
    type: "",
  });

  // Fetch channels on component mount
  useEffect(() => {
    fetchChannels();
  }, []);
  const token = sessionStorage.getItem("token");
  if (!token) {
    console.error("Token is missing");
    navigate("/"); // redirect if no token
    return;
  }

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);


      const response = await axios.get(
        `${API_BASE_URL}/saleschannel`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      setChannels(data);

      console.log("📦 Sales Channels:", data);

      // Set the default channel from API response
      const defaultCh = data.find((ch) => ch.isDefault);
      if (defaultCh) {
        setDefaultChannel(defaultCh.id);
      }
    } catch (err) {
      setError(
        "Failed to load channels: " +
        (err.response?.data?.message || err.message)
      );
      console.error("❌ Error fetching channels:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChannel((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddChannel = () => {
    if (!newChannel.name) return;

    setConfirmationModal({
      isOpen: true,
      title: "Add Sales Channel",
      message: `Are you sure you want to add sales channel "${newChannel.name}"?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          setError(null);

          const payload = {
            identifier: newChannel.name,
            description: `Customer added from ${newChannel.name}`,
            is_default: false,
          };

          const response = await fetch(`${API_BASE_URL}/saleschannel`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error("Failed to create channel");
          }

          setNewChannel({ name: "", description: "" });
          await fetchChannels();

          setMessageModal({
            message: "Sales channel added successfully",
            type: "success",
          });
        } catch (err) {
          setError("Failed to create channel: " + err.message);
          console.error("Error creating channel:", err);

          setMessageModal({
            message: "Failed to create sales channel",
            type: "error",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleStatusChange = async (id, status) => {
    try {
      setLoading(true);
      await axios.put(
        `${API_BASE_URL}/saleschannel/${id}`,
        { is_active: status === "Active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh channels after update
      await fetchChannels();

      Swal.fire({
        icon: "success",
        title: `Channel marked as ${status}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Status update failed:", error);
      Swal.fire("Error", "Could not update channel status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    const confirm = await Swal.fire({
      title: "Set as Default Sales Channel?",
      text: "Do you want to make this the default sales channel?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, set default",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/saleschannel/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ is_default: true }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set default channel");
      }

      setDefaultChannel(id);
      await fetchChannels(); // Optional: Refresh list

      Swal.fire({
        icon: "success",
        title: "Default channel set",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      setError("Failed to set default channel: " + err.message);
      console.error("Error setting default channel:", err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Cannot set default due to sales channel being inactive.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredChannels = channels.filter((ch) => {
    const matchesSearch =
      searchTerm === "" ||
      ch.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ch.description &&
        ch.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStartDate = !startDate || (ch.date && ch.date >= startDate);
    const matchesEndDate = !endDate || (ch.date && ch.date <= endDate);
    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  return (
    <div className="flex flex-col overflow-hidden w-full">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Loading...
        </div>
      )}
      <div className="border border-[#CDCDCD] rounded-lg p-4 bg-white shadow-sm max-w-4xl">
        <h2 className="text-lg text-left font-semibold text-blue-900 mb-4">
          Add Sales Channel
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-black">
              Identifier
            </label>
            <input
              type="text"
              name="name"
              value={newChannel.name}
              onChange={handleInputChange}
              placeholder=""
              className="bg-gray-100 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="text-sm font-semibold text-black">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={newChannel.description}
              onChange={handleInputChange}
              placeholder="Add description"
              className="bg-gray-100 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <button
            onClick={handleAddChannel}
            disabled={loading || !newChannel.name}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 my-4">
        <div className="relative border border-[#CDCDCD] rounded-lg">
          <input
            type="text"
            placeholder="Search by Channel Name or Description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-64"
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
        <div className="flex items-center bg-white border rounded-lg py-1 shadow-sm">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1"
          />
          <span className="mx-2 text-gray-600">TO</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1"
          />
        </div>
        <button
          onClick={() => {
            setSearchTerm("");
            setStartDate("");
            setEndDate("");
          }}
          className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
        >
          Clear Filters
        </button>
      </div>

      {/* Channel List Table */}
      <div className="flex flex-col h-[50vh] rounded-md">
        <div className="overflow-auto flex-grow bg-white ">
          <table className="min-w-full text-sm">
            <thead className="h-[70px] sticky top-0 bg-white border-b-black border-b-[2px]">
              <tr>
                <th className="py-2 border-b text-center">S.No</th>
                <th className="py-2 border-b text-center">Identifier</th>
                <th className="py-2 border-b text-center">Date</th>
                <th className="py-2 border-b text-center">Description</th>
                <th className="py-2 border-b text-center">Default</th>
                <th className="py-2 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-3"></tr>
              {filteredChannels.length > 0 ? (
                filteredChannels.map((ch, index) => (
                  <tr
                    key={ch.id || index}
                    className={`border-t h-[61px] top-[82px] ${index % 2 === 0 ? "bg-blue-50" : "bg-white"
                      }`}
                  >
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2 text-center font-medium text-blue-600">
                      {ch.identifier}
                    </td>
                    <td className="p-2 text-center">
                      {new Date(ch.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-center">{ch.description || "-"}</td>
                    <td className="p-2 text-center">
                      <input
                        type="radio"
                        name="defaultChannel"
                        checked={ch.is_default === true}
                        onChange={() => handleSetDefault(ch.id)}
                        disabled={loading}
                        className="w-4 h-4 text-blue-600 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>

                    <td className="p-2 text-center">
                      <select
                        value={ch.is_active ? "Active" : "Inactive"}
                        onChange={(e) => handleStatusChange(ch.id, e.target.value)}
                        className={`px-2 py-1 rounded-md border cursor-pointer ${ch.is_active ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        <option value="Active" className="text-green-600">
                          Active
                        </option>
                        <option value="Inactive" className="text-red-600">
                          Inactive
                        </option>
                      </select>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 px-4 text-center text-gray-500"
                  >
                    No channels found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Message Modal */}
      <MessageModal
        message={messageModal.message}
        type={messageModal.type}
        setMessage={(msg) => setMessageModal(prev => ({ ...prev, message: msg }))}
      />
    </div>
  );
};

export default SalesChannel;
