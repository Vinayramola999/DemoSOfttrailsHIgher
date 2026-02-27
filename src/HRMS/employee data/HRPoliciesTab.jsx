// import { useState, useEffect } from "react";
// import folder from "../../assests/folder.png";

// const HRPoliciesTab = () => {
//     const [policies, setPolicies] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [currentPage, setCurrentPage] = useState(1);
//     const [expandedId, setExpandedId] = useState(null);
//     const policiesPerPage = 10;

//     const filteredPolicies = policies.filter((p) => {
//         const category = categories.find((cat) => cat.id === p.category_id);
//         const categoryName = category ? category.name.toLowerCase() : "";

//         return (
//             p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             categoryName.includes(searchTerm.toLowerCase())
//         );
//     });

//     const indexOfLast = currentPage * policiesPerPage;
//     const indexOfFirst = indexOfLast - policiesPerPage;
//     const currentPolicies = filteredPolicies.slice(indexOfFirst, indexOfLast);
//     const totalPages = Math.ceil(filteredPolicies.length / policiesPerPage);

//     useEffect(() => {
//         const fetchPolicies = async () => {
//             const token = sessionStorage.getItem("token");

//             try {
//                 const [policyRes, categoryRes] = await Promise.all([
//                     fetch("https://devdemo.softtrails.net/hr-policy/policies", {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                             "Content-Type": "application/json",
//                         },
//                     }),
//                     fetch("https://devdemo.softtrails.net/hr-policy/categories", {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                             "Content-Type": "application/json",
//                         },
//                     }),
//                 ]);

//                 const policyData = await policyRes.json();
//                 const categoryData = await categoryRes.json();

//                 if (policyData.success && categoryData.data) {
//                     // ✅ Filter to only active policies
//                     const activePolicies = policyData.data.filter(
//                         (policy) =>
//                             policy.status === "Active" ||
//                             policy.status === true ||
//                             policy.status === 1
//                     );

//                     setPolicies(activePolicies);
//                     setCategories(categoryData.data);
//                 } else {
//                     console.error("Failed to fetch data");
//                 }
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//             }
//         };

//         fetchPolicies();
//     }, []);

//     const getCategoryName = (categoryId) => {
//         const category = categories.find((cat) => cat.id === categoryId);
//         return category ? category.name : "Unknown";
//     };

//     return (
//         <div className="p-1 w-full">
//             <div className="flex justify-between items-center mb-4">
//                 <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border rounded px-4 py-2 w-1/4" />
//             </div>

//             <div className="relative w-full overflow-hidden">
//                 <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[65vh]">
//                     <table className="min-w-full table-auto border-collapse text-sm">
//                         <thead className="text-[14px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
//                             <tr>
//                                 <th className="p-5 text-left font-semibold text-gray-600">S.No</th>
//                                 <th className="p-5 text-left font-semibold text-gray-600">Category</th>
//                                 <th className="p-5 text-left font-semibold text-gray-600">Policy Name</th>
//                                 <th className="p-5 text-left font-semibold text-gray-600">Description</th>
//                                 <th className="p-5 text-left font-semibold text-gray-600">Version</th>
//                                 <th className="p-5 text-left font-semibold text-gray-600">Date</th>
//                                 <th className="p-5 text-left font-semibold text-gray-600">Document</th>
//                             </tr>
//                         </thead>

//                         <tbody className="bg-white divide-y divide-gray-200">
//                             {currentPolicies.length > 0 ? (
//                                 currentPolicies.map((policy, idx) => (
//                                     <tr
//                                         key={policy.policy_id}
//                                         className={`border-t ${idx % 2 === 0 ? "bg-blue-50" : "bg-white"}`}
//                                     >
//                                         <td className="px-5 py-3 text-left text-gray-700">{indexOfFirst + idx + 1}</td>
//                                         <td className="px-5 py-3 text-left text-gray-700">{getCategoryName(policy.category_id)}</td>
//                                         <td className="px-5 py-3 text-left text-gray-700">{policy.name}</td>
//                                         <td className="px-5 py-3 text-left text-gray-700 max-w-[200px]">
//                                             <div className="overflow-hidden whitespace-pre-wrap">
//                                                 {expandedId === policy.policy_id ? (
//                                                     <> {policy.description || "NA"} <button onClick={() => setExpandedId(null)} className="text-blue-600 ml-2 hover:underline" > Less </button> </>
//                                                 ) : (
//                                                     <>
//                                                         {(policy.description && policy.description.length > 10) ? policy.description.substring(0, 10) + "..." : policy.description || "NA"}
//                                                         {policy.description && policy.description.length > 10 && (<button onClick={() => setExpandedId(policy.policy_id)} className="text-blue-600 ml-2 hover:underline" > More </button>)}
//                                                     </>
//                                                 )}
//                                             </div>
//                                         </td>
//                                         <td className="px-5 py-3 text-left text-gray-700">{policy.version || "NA"}</td>
//                                         <td className="px-5 py-3 text-left text-gray-700">
//                                             {new Date(policy.created_at).toLocaleDateString()}
//                                         </td>
//                                         <td className="px-5 py-4 text-left">
//                                             {policy.document ? (
//                                                 <a href={policy.document} target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 flex items-center" > <img src={folder} alt="preview" className="w-5 h-5 mr-2" /> </a>
//                                             ) : (<span className="text-gray-500">No Document</span>)}
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr><td colSpan="7" className="py-6 px-4 text-center text-gray-500">No policies found.</td></tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                     <div className="sticky bottom-0 flex flex-wrap justify-center items-center gap-2 p-3">
//                         <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400" > &lt; </button>
//                         <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm"> {currentPage} </span>
//                         <span className="text-sm font-medium">of</span>
//                         <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm"> {totalPages} </span>
//                         <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400" > &gt; </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };
// export default HRPoliciesTab;


//06/11/2025 with the new Policy functionlaity//////////
import { useState, useEffect } from "react";
import folder from "../../assests/folder.png";
import Pagination from "../../NewComponents/Pagination";
import { HRMS_API_BASE, DMS_API_BASE } from "../../config/apiBase";

const HRPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const policiesPerPage = 25;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    categoryId: "",
    policyName: "",
    description: "",
    status: true,
  });
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetch(`${DMS_API_BASE}/dmsapi/upload`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.json())
      .then((data) => {
        setServices(data);
      });
  }, [selectedService]);


  const filteredPolicies = policies.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * policiesPerPage;
  const indexOfFirst = indexOfLast - policiesPerPage;
  const currentPolicies = filteredPolicies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPolicies.length / policiesPerPage);

  const fetchPolicies = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${HRMS_API_BASE}/hr-policy/policies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setPolicies(result.data);
      } else {
        console.error("Failed to fetch policies");
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPolicies();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${HRMS_API_BASE}/hr-policy/categories`,
        { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
      );
      const data = await res.json();
      if (res.ok) {
        setCategories(data.data || []);
      } else {
        console.error("Failed to load categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  return (
    <div className="p-1 w-full">
      <div className="flex justify-between items-center mb-4">
        <input type="text" placeholder="Search Policy" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border rounded px-4 py-2 w-1/4" />
      </div>

      <div className="h-[75vh] sm:h-[60vh] md:h-[65vh] rounded-lg flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
          <table className="min-w-full table-auto border-collapse text-sm mb-20">
            <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }} >
              <tr>
                <th className="p-5 text-left text-black">S.No</th>
                <th className="p-5 text-left text-black">Category</th>
                <th className="p-5 text-left text-black">Policy</th>
                <th className="p-5 text-left text-black">Description</th>
                <th className="p-5 text-left text-black">Version</th>
                <th className="p-5 text-left text-black">Date</th>
                <th className="p-5 text-left text-black">Status</th>
                <th className="p-5 text-left text-black">Document</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={6} className="h-3 bg-white" /></tr>
              {currentPolicies.length === 0 ? (
                <tr> <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm"> No Policy found. </td> </tr>
              ) : (
                currentPolicies.map((policy, index) => (
                  <tr key={policy.id || index} className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-blue-50"} relative hover:z-[60]`} >
                    <td className="px-5 py-4 text-left">{indexOfFirst + index + 1}</td>
                    <td className="px-5 py-4 text-left">{getCategoryName(policy.category_id)}</td>
                    <td className="px-5 py-4 text-left">{policy.name}</td>
                    <td className="px-5 py-3 text-left text-gray-700 max-w-[200px] relative group">
                      <div className="truncate cursor-help"> {policy.description || "NA"} </div>
                      {policy.description && (
                        <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-[100] w-72 p-4 bg-white border border-gray-100 rounded-xl shadow-2xl text-gray-600 text-xs whitespace-normal backdrop-blur-md bg-white/95 ring-1 ring-black/5 animate-in fade-in zoom-in duration-200 origin-top-left">
                          <div className="font-bold mb-2 text-blue-600 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                            Policy Description
                          </div>
                          <p className="leading-relaxed">{policy.description}</p>
                          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-left">{policy.version}</td>
                    <td className="px-5 py-4 text-left">{new Date(policy.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-left">{policy.status ? (<span className="text-green-600 font-medium">Active</span>) : (<span className="text-red-600 font-medium">Inactive</span>)}</td>
                    <td className="px-5 py-4 text-left">
                      {policy.document ? (<a href={policy.document} target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 flex items-center" > <img src={folder} alt="preview" className="w-5 h-5 mr-2" /> </a>) : (<span className="text-gray-500">No Document</span>)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

    </div >
  );
};
export default HRPolicies;