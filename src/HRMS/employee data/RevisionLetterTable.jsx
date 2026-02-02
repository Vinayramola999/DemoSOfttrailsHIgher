import { useState, useEffect } from "react";
import Pagination from "../../NewComponents/Pagination";
import folder from "../../assests/folder.png";

const RevisionLetterTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const policiesPerPage = 25;
    const [HRDocuments, setHRDocuments] = useState([]);
    const token = sessionStorage.getItem("token");

    /* ---------------- Search & Pagination ---------------- */
    const filteredDocs = HRDocuments.filter((doc) =>
        doc.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLast = currentPage * policiesPerPage;
    const indexOfFirst = indexOfLast - policiesPerPage;
    const currentHRDocs = filteredDocs.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredDocs.length / policiesPerPage);

    /* ------------------ HR Documents ---------------- */

    const fetchHRDocuments = async () => {
        try {
            const userId = sessionStorage.getItem("userId");

            const response = await fetch(
                `https://devdemo.softtrails.net/documents/employee-documents/user/${userId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const result = await response.json();

            if (Array.isArray(result)) {
                const hrDocs = result.filter(
                    (doc) => doc.source === "HR Department"
                );
                setHRDocuments(hrDocs);
            } else {
                console.error("Unexpected API response:", result);
            }

        } catch (error) {
            console.error("Error fetching HR documents:", error);
        }
    };

    useEffect(() => {
        fetchHRDocuments();
    }, []);

    return (
        <div>
            <div className="flex items-center mb-4">
                <input type="text" placeholder="Search" className="border rounded-lg px-4 py-2 w-1/5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {/* ---------------- TABLE ---------------- */}
            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0 z-10" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Emp Code</th>
                                <th className="p-5 text-left text-black">Employee Name</th>
                                <th className="p-5 text-left text-black">Category</th>
                                <th className="p-5 text-left text-black">Date</th>
                                <th className="p-5 text-left text-black">Document</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {filteredDocs.length === 0 && (<tr> <td colSpan="7" className="text-center p-4 text-gray-500"> No Documents Found </td> </tr>)}
                            {currentHRDocs.map((doc, index) => (
                                <tr key={doc.id} className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}`} >
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> {indexOfFirst + index + 1} </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{doc.employee_code || "NA"}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> {doc.user_name || "NA"} </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{doc.category_name || "NA"}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{doc.doc_date ? new Date(doc.doc_date).toLocaleDateString() : "NA"}</td>
                                    <td className="px-5 py-4 text-left"> <a href={doc.doc_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" > <img src={folder} alt="preview" className="w-5 h-5 mr-2" /> </a> </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        if (page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                        }
                    }}
                />
            </div>
        </div>
    );
};
export default RevisionLetterTable;