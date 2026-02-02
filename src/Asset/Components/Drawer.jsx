// Drawer.jsx
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

export default function Drawer({ open, title, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Background Overlay */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="fixed right-0 top-0 h-full w-full sm:max-w-3xl z-50 flex flex-col 
              bg-gradient-to-b from-white via-blue-50/90 to-indigo-50/80 
              shadow-2xl border-l border-gray-200/50 rounded-l-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/70 backdrop-blur-md sticky top-0 z-10">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 tracking-tight">
                {title}
              </h3>
              <motion.button
                onClick={onClose}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full text-gray-500 hover:text-red-600 transition"
              >
                <FiX className="text-2xl" />
              </motion.button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent">
              {children}
            </div>
            {/* Bottom Accent */}
            <div className="h-[4px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-md"></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
