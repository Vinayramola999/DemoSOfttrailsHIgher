import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PiEyeClosedDuotone } from "react-icons/pi";
import { FaRegEye } from "react-icons/fa";
import { IoEyeOffOutline } from "react-icons/io5";

export default function CreatePlans() {
  const [plans, setPlans] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [livePlan, setLivePlan] = useState(null);

  const [formData, setFormData] = useState({
    planName: "",
    description: "",
  });

  const [editData, setEditData] = useState({
    planName: "",
    description: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const hasOnlySpacesOrEmpty = (value) => {
    if (typeof value !== "string") {
      if (value == null) return true;
      if (typeof value === "number") value = String(value);
      if (typeof value === "object") return false;
    }
    return value.trim() === "";
  };

  const fetchPlans = async () => {
    try {
      const res = await axios.get(
        "https://saaspro.softtrails.net/saas/softsub/pro/api/license-plans"
      );
      setPlans(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch plans", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    // Validate inputs: do not allow empty or only-space values
    if (
      hasOnlySpacesOrEmpty(formData.planName) ||
      hasOnlySpacesOrEmpty(formData.description)
    ) {
      toast.error("Fields cannot be empty or only spaces.");
      return;
    }
    try {
      await axios.post(
        "https://saaspro.softtrails.net/saas/softsub/pro/api/license-plans",
        formData
      );
      toast.success("Plan created successfully!");
      setFormData({ planName: "", description: "" });
      setShowCreateModal(false);
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create plan");
    }
  };

  const handleEditSubmit = async () => {
    // Validate inputs: do not allow empty or only-space values
    if (
      hasOnlySpacesOrEmpty(editData.planName) ||
      hasOnlySpacesOrEmpty(editData.description)
    ) {
      toast.error("Fields cannot be empty or only spaces.");
      return;
    }
    try {
      await axios.put(
        `https://saaspro.softtrails.net/saas/softsub/pro/api/license-plans/${selectedPlan.id}`,
        editData
      );
      toast.success("Plan updated successfully!");
      setShowEditModal(false);
      setSelectedPlan(null);
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update plan");
    }
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setEditData({
      planName: plan.planName,
      description: plan.description,
    });
    setShowEditModal(true);
  };

  // Live modal open
  const openLiveModal = (plan) => {
    setLivePlan(plan);
    setShowLiveModal(true);
  };

  // Action handlers
  const handlePublish = async () => {
    try {
      await axios.put(
        `https://saaspro.softtrails.net/saas/softsub/pro/api/license-plans/${livePlan.id}/publish`
      );
      toast.success("Plan published!");
      setShowLiveModal(false);
      fetchPlans();
    } catch (e) {
      toast.error("Failed to publish plan");
    }
  };
  const handleUnpublish = async () => {
    try {
      await axios.put(
        `https://saaspro.softtrails.net/saas/softsub/pro/api/license-plans/${livePlan.id}/unpublish`
      );
      toast.success("Plan unpublished!");
      setShowLiveModal(false);
      fetchPlans();
    } catch (e) {
      toast.error("Failed to unpublish plan");
    }
  };
  const handleVisible = async () => {
    // Prevent enabling visibility if there are already 3 visible plans
    const visibleCount = plans.filter((p) => p.visibility).length;
    if (!livePlan.visibility && visibleCount >= 3) {
      toast.error("Maximum 3 plans can be visible at a time.");
      return;
    }

    try {
      await axios.put(
        `https://saaspro.softtrails.net/saas/softsub/pro/api/license-plans/${livePlan.id}/visible`
      );
      toast.success("Plan is now visible!");
      setShowLiveModal(false);
      fetchPlans();
    } catch (e) {
      toast.error(
        "Failed to make plan visible. Make sure it is published and less than 3 plans are visible."
      );
    }
  };
  const handleHide = async () => {
    try {
      await axios.put(
        `https://saaspro.softtrails.net/saas/softsub/pro/api/license-plans/${livePlan.id}/hide`
      );
      toast.success("Plan hidden!");
      setShowLiveModal(false);
      fetchPlans();
    } catch (e) {
      toast.error("Failed to hide plan");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row  py-2 mb-[112px]  ">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        containerStyle={{ marginTop: "60px" }}
      />
      {/* Left Side — Plan Lists */}
      <div className="w-full lg:w-[800px] pr-20 ">
        {/* ✅ Published Plans Section */}
        <h3 className="text-lg font-semibold mb-3 text-green-600">
          Visible Plans
        </h3>
        <div className="space-y-4 mb-8">
          {plans
            .filter((plan) => plan.visibility && plan.publish)
            .map((plan) => (
              <div
                key={plan.id}
                className="border rounded-2xl p-3 shadow-sm bg-white hover:shadow-md transition w-full flex flex-col sm:flex-row justify-between items-start sm:items-center"
              >
                <div>
                  <h4 className="text-lg font-semibold">{plan.planName}</h4>
                  <p className="text-sm text-gray-500 my-1">
                    {plan.description}
                  </p>
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <button
                    onClick={() => openLiveModal(plan)}
                    className="bg-green-100 p-2 rounded-full shadow hover:scale-110 transition"
                    title="Live Actions"
                  >
                    {/* ...live icon... */}
                    <FaRegEye />
                  </button>
                </div>
              </div>
            ))}
          {plans.filter((plan) => plan.visibility && plan.publish).length ===
            0 && (
            <p className="text-gray-500 text-sm">No published plans yet.</p>
          )}
        </div>

        {/* 🚫 Unpublished Plans Section */}
        <h3 className="text-lg font-semibold mb-3 text-red-600">
          Hidden Plans
        </h3>
        <div className="space-y-4">
          {plans
            .filter((plan) => !plan.visibility || !plan.publish)
            .map((plan) => (
              <div
                key={plan.id}
                className="border rounded-2xl p-3 shadow-sm w-full bg-gray-50 hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center"
              >
                <div>
                  <h4 className="text-lg font-semibold">{plan.planName}</h4>
                  <p className="text-sm text-gray-500 my-1">
                    {plan.description}
                  </p>
                </div>
                <div className="flex gap-3 mt-4 sm:mt-0">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="bg-[#F2F2F2] p-2 rounded-full shadow hover:scale-110 transition"
                    title="Edit"
                  >
                    {/* ...svg... */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="#000"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="m5 16l-1 4l4-1L19.586 7.414a2 2 0 0 0 0-2.828l-.172-.172a2 2 0 0 0-2.828 0zM15 6l3 3m-5 11h8"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => openLiveModal(plan)}
                    className="bg-[#F2F2F2] p-2 px-3 rounded-full shadow hover:scale-110 transition"
                    title="Live Actions"
                  >
                    {/* ...live icon... */}
                    <IoEyeOffOutline />
                  </button>
                </div>
              </div>
            ))}
          {plans.filter((plan) => !plan.visibility || !plan.publish).length ===
            0 && <p className="text-gray-500 text-sm">No unpublished plans.</p>}
        </div>
      </div>

      {/* Right Side — Create Button */}
      <div className="w-full lg:w-auto flex justify-center lg:items-start items-center mt-8 lg:mt-0">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#005AE6] py-3 px-9 rounded-lg text-white h-[50px] w-full max-w-xs"
        >
          Create new plan
        </button>
      </div>

      {/* ➕ Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2">
          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg max-w-md w-full relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <div className="space-y-4">
              <input
                type="text"
                name="planName"
                placeholder="Plan Name"
                value={formData.planName}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-[#005AE6] to-[#003280] text-white px-6 py-2 rounded-full w-full"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ Edit Modal */}
      {showEditModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2">
          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg max-w-md w-full relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">Edit Plan</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="planName"
                placeholder="Plan Name"
                value={editData.planName}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={editData.description}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
              />

              <button
                onClick={handleEditSubmit}
                className="bg-yellow-600 text-white px-6 py-2 rounded-full w-full hover:bg-yellow-700"
              >
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE MODAL */}
      {showLiveModal && livePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2">
          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg max-w-md w-full relative">
            <button
              onClick={() => setShowLiveModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Live Actions for{" "}
              <span className="text-blue-600">{livePlan.planName}</span> Plan
            </h3>
            <div className="space-y-3">
              {/* Publish/Unpublish Toggle Button */}
              <button
                onClick={livePlan.publish ? handleUnpublish : handlePublish}
                className={`w-full ${
                  livePlan.publish
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white py-2 rounded`}
              >
                {livePlan.publish ? "Unpublish Plan" : "Publish Plan"}
              </button>
              {/* Visible/Hide Toggle Button */}
              <button
                onClick={livePlan.visibility ? handleHide : handleVisible}
                className={`w-full ${
                  livePlan.visibility
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white py-2 rounded`}
                disabled={!livePlan.publish && !livePlan.visibility}
              >
                {livePlan.visibility ? "Hide Plan" : "Make Visible"}
              </button>
              <div className="text-xs text-gray-500 ">
                <div className="space-y-5 ">
                  <p>Only 3 plan can be visible at a time in website</p>
                  <p>
                    {" "}
                    The plan name can be change only if the plan is unpublished
                    and not buyed by any user{" "}
                  </p>
                  <p>
                    When the plan is unpublished it cannot be shown in the
                    website{" "}
                  </p>
                  <p>
                    Visible and hide is for showing or hiding the product on
                    website
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
