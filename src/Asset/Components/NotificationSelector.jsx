import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, X } from "lucide-react";

const NotificationSelector = ({ open, onClose, onConfirm }) => {
  const [selectedOptions, setSelectedOptions] = useState({
    email: false,
    sms: false,
  });

  const handleToggle = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleConfirm = () => {
    const selected = Object.keys(selectedOptions).filter((key) => selectedOptions[key]);
    if (selected.length === 0) {
      alert("Please select at least one notification method.");
      return;
    }
    onConfirm(selected);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative w-[90%] sm:w-[420px] bg-white rounded-3xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] p-7 border border-gray-100"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 transition"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-1 text-center tracking-tight">
              Send Notification
            </h2>
            <p className="text-sm text-gray-500 text-center mb-7">
              Choose one or more channels to notify the user
            </p>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* EMAIL */}
              <motion.div
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleToggle("email")}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border cursor-pointer transition-all ${
                  selectedOptions.email
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md"
                    : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"
                }`}
              >
                <motion.div
                  animate={{ scale: selectedOptions.email ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all ${
                    selectedOptions.email
                      ? "bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg"
                      : "bg-gray-100"
                  }`}
                >
                  <Mail
                    size={28}
                    className={`transition ${
                      selectedOptions.email ? "text-white" : "text-gray-600"
                    }`}
                  />
                </motion.div>
                <span
                  className={`mt-3 font-medium text-sm ${
                    selectedOptions.email ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  Email
                </span>
                <span
                  className={`text-xs ${
                    selectedOptions.email ? "text-blue-500" : "text-gray-400"
                  }`}
                >
                  via registered email
                </span>
              </motion.div>

              {/* SMS */}
              <motion.div
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleToggle("sms")}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border cursor-pointer transition-all ${
                  selectedOptions.sms
                    ? "border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-md"
                    : "border-gray-200 hover:border-pink-400 hover:bg-pink-50/50"
                }`}
              >
                <motion.div
                  animate={{ scale: selectedOptions.sms ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all ${
                    selectedOptions.sms
                      ? "bg-gradient-to-tr from-pink-600 to-orange-500 shadow-lg"
                      : "bg-gray-100"
                  }`}
                >
                  <MessageSquare
                    size={28}
                    className={`transition ${
                      selectedOptions.sms ? "text-white" : "text-gray-600"
                    }`}
                  />
                </motion.div>
                <span
                  className={`mt-3 font-medium text-sm ${
                    selectedOptions.sms ? "text-pink-700" : "text-gray-700"
                  }`}
                >
                  SMS
                </span>
                <span
                  className={`text-xs ${
                    selectedOptions.sms ? "text-pink-500" : "text-gray-400"
                  }`}
                >
                  via phone number
                </span>
              </motion.div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 transition font-semibold shadow-lg"
              >
                Send
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationSelector;
