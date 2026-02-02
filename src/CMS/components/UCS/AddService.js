// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaHome, FaSignOutAlt } from 'react-icons/fa';

// const AddService = () => {
//   const navigate = useNavigate();
//   const [selectedOption, setSelectedOption] = useState('email');

//   // State for form data
//   const [formData, setFormData] = useState({
//     serviceName: '',
//     host: '',
//     port: '',
//     username: '',
//     password: '',
//     apiKey: '',
//     apiUrl: '',
//     senderId: '',
//     route: '',
//     language: '',
//   });

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     // navigate('/');
//   };

//   // Handle form input change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async () => {
//     let url =
//       selectedOption === 'email'
//         ? 'https://devdemo.softtrails.net/ucs/intra/api/email/save'
//         : 'https://devdemo.softtrails.net/ucs/intra/api/sms/save';
// // https://devapi.softtrails.net/saas/ucs/test
//     let data =
//       selectedOption === 'email'
//         ? {
//             serviceName: formData.serviceName,
//             host: formData.host,
//             port: formData.port,
//             username: formData.username,
//             password: formData.password,
//           }
//         : {
//             serviceName: formData.serviceName,
//             apiKey: formData.apiKey,
//             apiUrl: formData.apiUrl,
//             senderId: formData.senderId,
//             route: formData.route,
//             language: formData.language,
//           };
// const token = localStorage.getItem('token');
//     try {

//       const response = await fetch(url, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//          },
//         body: JSON.stringify(data),
//       });

//       const responseText = await response.text(); // Raw text response le rahe hain

//       console.log('Server Response:', responseText); // Console me response dekhne ke liye
//       alert(responseText); // User ko response dikhane ke liye

//       if (!response.ok) {
//         throw new Error('Request failed with status ' + response.status);
//       }

//       alert('Service setup successfully!');
//       navigate('/Cards'); // Redirect after success
//     } catch (error) {
//       console.error('Error submitting data:', error);
//       alert('Failed to save the service: ' + error.message);
//     }
//   };

//   return (
//     <div className="flex h-screen w-screen bg-gray-100">
//       <div className="flex flex-col w-full h-full">
//         {/* Header */}
//         <div className="bg-custome-blue w-full p-4 flex justify-between items-center shadow-md">
//           <button
//             onClick={() => navigate('/Cards')}
//             className="flex items-center p-2 rounded-full hover:bg-blue-700 transition"
//           >
//             <FaHome className="text-white" size={25} />
//           </button>
//           <h1 className="text-white text-2xl font-bold">
//             Setup Communication Service
//           </h1>
//           <button
//             onClick={handleLogout}
//             className="bg-white flex items-center p-2 rounded-full hover:bg-gray-200 transition"
//           >
//             <FaSignOutAlt className="text-black" size={20} />
//           </button>
//         </div>

//         {/* Page Content */}
//         <div className="flex justify-center items-center h-full w-full p-6">
//           <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
//             <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
//               Setup Communication Service
//             </h2>

//             {/* Radio Buttons for selecting Email/SMS */}
//             <div className="mb-6">
//               <label className="block text-gray-700 font-medium mb-2">
//                 Select Communication Type:
//               </label>
//               <div className="flex gap-4">
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="radio"
//                     value="email"
//                     checked={selectedOption === 'email'}
//                     onChange={(e) => setSelectedOption(e.target.value)}
//                   />
//                   Email
//                 </label>
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="radio"
//                     value="sms"
//                     checked={selectedOption === 'sms'}
//                     onChange={(e) => setSelectedOption(e.target.value)}
//                   />
//                   SMS
//                 </label>
//               </div>
//             </div>

//             {/* Service Name Input */}
//             <div className="mb-6">
//               <label className="block text-gray-700 font-medium mb-2">
//                 Service Name:
//               </label>
//               <input
//                 type="text"
//                 name="serviceName"
//                 value={formData.serviceName}
//                 onChange={handleChange}
//                 placeholder="Enter Service Name"
//                 className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>

//             {/* Form */}
//             <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
//               {selectedOption === 'email' ? (
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <input
//                     type="text"
//                     name="host"
//                     value={formData.host}
//                     onChange={handleChange}
//                     placeholder="Host"
//                     className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                   <input
//                     type="number"
//                     name="port"
//                     value={formData.port}
//                     onChange={handleChange}
//                     placeholder="Port"
//                     className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                   <input
//                     type="text"
//                     name="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                     placeholder="Username"
//                     className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Password"
//                     className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                   <input
//                     type="text"
//                     name="apiKey"
//                     value={formData.apiKey}
//                     onChange={handleChange}
//                     placeholder="API Key"
//                     className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                   <input
//                     type="text"
//                     name="apiUrl"
//                     value={formData.apiUrl}
//                     onChange={handleChange}
//                     placeholder="API URL"
//                     className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                   <input
//                     type="text"
//                     name="senderId"
//                     value={formData.senderId}
//                     onChange={handleChange}
//                     placeholder="Sender ID"
//                     className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                   <input
//                     type="text"
//                     name="route"
//                     value={formData.route}
//                     onChange={handleChange}
//                     placeholder="Route"
//                     className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                   <input
//                     type="text"
//                     name="language"
//                     value={formData.language}
//                     onChange={handleChange}
//                     placeholder="Language"
//                     className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Buttons */}
//             <div className="flex justify-end gap-4 mt-6">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="border px-5 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default AddService;
