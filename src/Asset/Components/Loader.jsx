// import React from "react";
// import { motion } from "framer-motion";

// const LoaderModal = ({ isVisible, text = "Preparing magic for you..." }) => {
//   if (!isVisible) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-black bg-opacity-90 backdrop-blur-md z-50">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.4, ease: "easeOut" }}
//         className="flex flex-col items-center"
//       >
//         {/* Animated Orb */}
//         <div className="relative w-28 h-28">
//           <motion.div
//             className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-sky-400 to-cyan-300 blur-md"
//             animate={{
//               scale: [1, 1.3, 1],
//               opacity: [0.7, 1, 0.7],
//               rotate: [0, 360],
//             }}
//             transition={{
//               duration: 2.5,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           />
//           <motion.div
//             className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-600 blur-md opacity-80"
//             animate={{
//               scale: [1.2, 0.9, 1.2],
//               rotate: [360, 0],
//             }}
//             transition={{
//               duration: 3,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           />
//           <motion.div
//             className="absolute inset-6 rounded-full bg-white/10 backdrop-blur-sm shadow-inner"
//             animate={{
//               scale: [1, 1.05, 1],
//               opacity: [0.8, 1, 0.8],
//             }}
//             transition={{
//               duration: 2,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           />
//         </div>

//         {/* Text */}
//         <motion.p
//           initial={{ opacity: 0, y: 15 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3, duration: 0.6 }}
//           className="text-gray-200 text-lg mt-6 font-semibold tracking-wide"
//         >
//           {text}
//         </motion.p>

//         {/* Subtle glow ring */}
//         <div className="mt-3 w-24 h-1 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 rounded-full animate-pulse"></div>
//       </motion.div>
//     </div>
//   );
// };

import React from "react";
import { motion } from "framer-motion";

const SoftTrailsLoader = ({ isVisible, message = "Sending notification securely..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center overflow-hidden text-white z-[9999] bg-[#050913]">
      {/* === Dynamic Gradient Background === */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(14, 165, 233, 0.15), rgba(79, 70, 229, 0.15), rgba(147, 51, 234, 0.1))",
          backgroundSize: "200% 200%",
          filter: "blur(60px)",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* === Floating Light Particles === */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[3px] h-[3px] bg-cyan-300 rounded-full shadow-lg"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* === Center Glow === */}
      <motion.div
        className="absolute w-[30rem] h-[30rem] bg-blue-500/25 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* === Logo + Branding === */}
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold tracking-wide relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
          SoftTrails
        </span>
      </motion.h1>

      <motion.p
        className="text-gray-300 text-base font-light mb-10 mt-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Empowering Smart Asset Communication
      </motion.p>

      {/* === Animated Sending Particles === */}
      <div className="relative w-64 h-20 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-0 w-4 h-4 bg-gradient-to-tr from-blue-400 to-cyan-300 rounded-full shadow-lg"
            animate={{
              x: ["0%", "120%"],
              opacity: [0, 1, 0],
              y: [0, -8, 0],
            }}
            transition={{
              duration: 1.8,
              delay: i * 0.25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          ></motion.div>
        ))}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full"
          animate={{ width: ["0%", "100%", "0%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* === Dynamic message === */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-gray-300 text-sm italic z-10"
      >
        {message}
      </motion.p>

      {/* === Bottom subtle brand line === */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 text-xs text-gray-400 tracking-wide"
      >
        Powered by SoftTrails • Intelligent Asset Management Suite
      </motion.p>
    </div>
  );
};

export default SoftTrailsLoader;

