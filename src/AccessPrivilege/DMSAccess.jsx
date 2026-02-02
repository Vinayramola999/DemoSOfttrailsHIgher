// import axios from "axios";
// import Modal from "react-modal";
// import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";
// import Select from "react-select";
// import React, { useState } from "react";
// import useFetchEmails from "../NewComponents/useFetchEmails";
// Modal.setAppElement("#root");

// const UpdateAccess = () => {
//   const emails = useFetchEmails();
//   const [selectedEmail, setSelectedEmail] = useState("");
//   const [apiAccess, setApiAccess] = useState([]);
//   const [isDocumentChecked, setIsDocumentChecked] = useState(false);
//   const [hasAmsAccess, setHasAmsAccess] = useState(false);

//   const handleEmailChange = async (e) => {
//     const userId = e.target.value;
//     setSelectedEmail(userId);
//     if (userId) {
//       try {
//         // Fetch API access
//         const response = await axios.get(
//           `https://devdemo.softtrails.net/access/access/${userId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${sessionStorage.getItem("token")}`,
//             },
//           }
//         );

//         const filteredAccess = response.data.filter(
//           (access) => access.user_id === parseInt(userId)
//         );
//         const apiAccessNames = filteredAccess.map((access) => access.api_name);

//         setApiAccess(apiAccessNames);
//         setIsDocumentChecked(apiAccessNames.includes("doc_management"));
//         setHasAmsAccess(apiAccessNames.includes("update_access"));
//       } catch (error) {
//         Swal.fire({
//           icon: "warning",
//           title: "No Access",
//           text: "No Access is available for the provided User.",
//         });
//       }
//     } else {
//       setApiAccess([]);
//       setHasAmsAccess(false);
//       setIsDocumentChecked(false);
//     }
//   };

//   const handleApiAccessChange = async (apiName) => {
//     const isAlreadySelected = apiAccess.includes(apiName);
//     setApiAccess(
//       (prev) =>
//         isAlreadySelected
//           ? prev.filter((name) => name !== apiName) // Remove API if unchecked
//           : [...prev, apiName] // Add API if checked
//     );

//     if (apiName === "update_access") {
//       setHasAmsAccess((prev) => !prev);
//     } else if (apiName === "doc_management") {
//       setIsDocumentChecked((prev) => !prev);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = sessionStorage.getItem("token");

//     if (!token) {
//       Swal.fire({
//         icon: "error",
//         title: "Unauthorized",
//         text: "Token does not exist.",
//       });
//       return;
//     }

//     const selectedModule = "DMS";
//     const selectedApiAccess = [];
//     if (isDocumentChecked) selectedApiAccess.push("doc_management");
//     try {
//       const response = await axios.put(
//         "https://devdemo.softtrails.net/access/update_access",
//         {
//           user_id: selectedEmail,
//           module: selectedModule,
//           api_access: selectedApiAccess.length ? selectedApiAccess : [], // Ensure empty value for unchecked UCS
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         Swal.fire({
//           icon: "success",
//           title: "Success",
//           text: "User Updated Successfully!",
//         });
//       } else if (
//         response.data.error ===
//         "User not found. Please check the email entered."
//       ) {
//         Swal.fire({
//           icon: "error",
//           title: "User Not Found",
//           text: "Please check the email entered.",
//         });
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: `Error: ${response.data.error}`,
//         });
//       }
//     } catch (error) {
//       const { response } = error;

//       if (response) {
//         if (response.status === 403) {
//           Swal.fire({
//             icon: "warning",
//             title: "Permission Denied",
//             text: "You do not have permission to perform this action.",
//           });
//         } else if (response.status === 404) {
//           Swal.fire({
//             icon: "error",
//             title: "User Not Found",
//             text: "Please check the email entered.",
//           });
//         } else {
//           Swal.fire({
//             icon: "error",
//             title: "Update Failed",
//             text: "Error updating API access.",
//           });
//         }
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: "Network Error",
//           text: "Error updating API access.",
//         });
//       }
//     }
//   };

//   //TOKEN AND USERPROFILE START
//   const navigate = useNavigate();
//   const getToken = () => {
//     const token = sessionStorage.getItem("token");
//     return token;
//   };
//   const token = getToken();
//   console.log("Retrieved token:", token);
//   //END

//   return (
//     <div className="w-full max-h-[80vh] overflow-auto">
//       <div className="bg-white p-4 rounded-lg shadow-md mt-3">
//         <form onSubmit={handleSubmit}>
//           <div className="flex flex-col sm:flex-row sm:items-center mt-5 ml-5 w-full sm:w-[50%]">
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4"
//             >
//               {" "}
//               Select User:{" "}
//             </label>
//             <div className="w-full sm:w-[60%]">
//               <Select
//                 id="email"
//                 options={emails}
//                 value={
//                   emails.find((user) => user.value === selectedEmail) || null
//                 }
//                 onChange={(selectedOption) => {
//                   handleEmailChange({
//                     target: { value: selectedOption?.value || "" },
//                   });
//                 }}
//                 placeholder="Search or select user..."
//                 isSearchable
//                 classNamePrefix="react-select"
//                 styles={{
//                   control: (base) => ({
//                     ...base,
//                     borderRadius: "0.5rem",
//                     padding: "2px",
//                     borderColor: "#d1d5db",
//                     boxShadow: "none",
//                     "&:hover": { borderColor: "#2563eb" },
//                   }),
//                 }}
//               />
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row mt-6">
//             <div className="w-full sm:w-1/2  rounded-lg p-4 h-auto max-h-[450px] overflow-y-auto">
//               <div className=" rounded-lg overflow-y-auto">
//                 <label className="flex items-center">
//                   <input
//                     type="checkbox"
//                     onChange={() => handleApiAccessChange("doc_management")}
//                     checked={isDocumentChecked}
//                     className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                   />
//                   <span className="text-blue-600 text-lg font-bold ml-5">
//                     {" "}
//                     Document Management System
//                   </span>
//                 </label>
//               </div>
//             </div>
//           </div>

//           <div className="mt-6 ml-5">
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
//             >
//               Update Access
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };
// export default UpdateAccess;








import axios from "axios";
import Modal from "react-modal";
import Swal from "sweetalert2";
import Select from "react-select";
import React, { useState } from "react";
import useFetchEmails from "../NewComponents/useFetchEmails";
Modal.setAppElement("#root");

const DMSAccess = () => {
    const [selectedEmail, setSelectedEmail] = useState("");
    const [apiAccess, setApiAccess] = useState([]);
    const [isDMSChecked, setIsDMSChecked] = useState(false);
    const [hasAmsAccess, setHasAmsAccess] = useState(false);
    const emails = useFetchEmails();

    const handleEmailChange = async (e) => {
        const userId = e.target.value;
        setSelectedEmail(userId);
        if (userId) {
            try {
                // Fetch API access
                const response = await axios.get(`https://devdemo.softtrails.net/access/access/${userId}`,
                    { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}`, }, }
                );

                const filteredAccess = response.data.filter(
                    (access) => access.user_id === parseInt(userId)
                );
                const apiAccessNames = filteredAccess.map((access) => access.api_name);

                setApiAccess(apiAccessNames);
                setIsDMSChecked(apiAccessNames.includes("doc_management"));
                setHasAmsAccess(apiAccessNames.includes("update_access"));
            } catch (error) {
                Swal.fire({
                    icon: "warning",
                    title: "No Access",
                    text: "No Access is available for the provided User.",
                });
            }
        } else {
            setApiAccess([]);
            setHasAmsAccess(false);
            setIsDMSChecked(false);
        }
    };

    const handleApiAccessChange = async (apiName) => {
        const isAlreadySelected = apiAccess.includes(apiName);
        setApiAccess(
            (prev) =>
                isAlreadySelected
                    ? prev.filter((name) => name !== apiName)
                    : [...prev, apiName]
        );

        if (apiName === "update_access") {
            setHasAmsAccess((prev) => !prev);
        } else if (apiName === "doc_management") {
            setIsDMSChecked((prev) => !prev);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem("token");
        if (!token) {
            Swal.fire({
                icon: "error",
                title: "Unauthorized",
                text: "Token does not exist.",
            });
            return;
        }
        const selectedModule = "DMS";
        const selectedApiAccess = [];
        if (isDMSChecked) selectedApiAccess.push("doc_management");
        try {
            const response = await axios.put(
                "https://devdemo.softtrails.net/access/update_access",
                {
                    user_id: selectedEmail,
                    module: selectedModule,
                    api_access: selectedApiAccess.length ? selectedApiAccess : [], // Ensure empty value for unchecked UCS
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "User Updated Successfully!",
                });
            } else if (
                response.data.error ===
                "User not found. Please check the email entered."
            ) {
                Swal.fire({
                    icon: "error",
                    title: "User Not Found",
                    text: "Please check the email entered.",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `Error: ${response.data.error}`,
                });
            }
        } catch (error) {
            const { response } = error;

            if (response) {
                if (response.status === 403) {
                    Swal.fire({
                        icon: "warning",
                        title: "Permission Denied",
                        text: "You do not have permission to perform this action.",
                    });
                } else if (response.status === 404) {
                    Swal.fire({
                        icon: "error",
                        title: "User Not Found",
                        text: "Please check the email entered.",
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Update Failed",
                        text: "Error updating API access.",
                    });
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Network Error",
                    text: "Error updating API access.",
                });
            }
        }
    };

    return (
        <div className="w-full overflow-auto">
            <div className="bg-white p-4 rounded-lg h-[75vh] shadow-md mt-3">
                <form onSubmit={handleSubmit} className="flex flex-col min-h-[70vh]">
                    <div className="flex flex-col sm:flex-row sm:items-center mt-5 ml-5 w-full sm:w-[50%]">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4" > Select User:</label>
                        <div className="w-full sm:w-[60%]">
                            <Select
                                id="email"
                                options={emails}
                                value={emails.find((user) => user.value === selectedEmail) || null}
                                onChange={(selectedOption) => { handleEmailChange({ target: { value: selectedOption?.value || "" }, }); }}
                                placeholder="Search or select user..."
                                isSearchable
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderRadius: "0.5rem",
                                        padding: "2px",
                                        borderColor: "#d1d5db",
                                        boxShadow: "none",
                                        "&:hover": { borderColor: "#2563eb" },
                                    }),
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row mt-6">
                        <div className="w-full sm:w-1/2  rounded-lg p-4 h-auto max-h-[450px] overflow-y-auto">
                            <div className=" rounded-lg overflow-y-auto">
                                <label className="flex items-center">
                                    <input type="checkbox" onChange={() => handleApiAccessChange("doc_management")} checked={isDMSChecked} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                    <span className="text-blue-600 text-lg font-bold ml-5"> Document Management System </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex justify-start pr-6 pb-6">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md" > Update Access </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default DMSAccess;