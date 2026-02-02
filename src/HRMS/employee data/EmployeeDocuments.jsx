import React, { useEffect, useState } from "react";
import axios from "axios";
import pdf from "../../assests/folder.png";
import { FaUpload } from "react-icons/fa";
import { DMS_API_BASE } from "../../config/apiBase";

const EmployeeDocuments = () => {
  const [categories, setCategories] = useState([]);
  const [userDocs, setUserDocs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  const API_GET_DOCS = `https://devdemo.softtrails.net/documents/employee-documents/user/${userId}?source=my_doc`;
  const API_GET_CATEGORIES = `https://devdemo.softtrails.net/documents/categories?source=emp_doc`;
  const API_POST_DOC = `https://devdemo.softtrails.net/documents/employee-documents`;

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_GET_CATEGORIES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserDocs = async () => {
    try {
      const res = await axios.get(API_GET_DOCS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserDocs(res.data || []);
    } catch (err) {
      setError("Unable to load documents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUserDocs();
  }, []);

  const getDmsPublishId = async () => {
    try {
      const response = await axios.get(`${DMS_API_BASE}/mapping/check`,
        {
          params: {
            service_name: "HRMS",
            doctype: "Salary Slip",
            doc_name: "Salary Slip",
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.dms_publish_id || null;
    } catch {
      return null;
    }
  };

  const handleDmsUpload = async (file) => {
    const publishId = await getDmsPublishId();

    const formData = new FormData();
    formData.append("documents", file);
    formData.append("ref", "DMS");

    formData.append(
      "metadata",
      JSON.stringify([
        {
          service: "HRMS",
          publish_id: parseInt(publishId),
          user_id: userId,
          document_name: file.name,
        },
      ])
    );
    const response = await fetch(`${DMS_API_BASE}/dmsapi/upload-documents`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
    const data = await response.json();
    return data.uploaded_files?.[0]?.file_url || null;
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      alert("Please select a file");
      return;
    }

    try {
      setUploading(true);

      // 1️⃣ Upload to DMS
      const documentUrl = await handleDmsUpload(uploadFile);
      if (!documentUrl) {
        alert("File upload failed!");
        return;
      }

      // 2️⃣ Create final payload
      const payload = {
        user_id: userId,
        category_id: selectedCategory.id,
        doc_date: new Date().toISOString().split("T")[0],
        source: "my_doc",
        doc_url: documentUrl,
      };

      // 3️⃣ Save to employee-documents
      await axios.post(API_POST_DOC, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Document Uploaded Successfully!");

      // 4️⃣ Refresh table
      fetchUserDocs();

      // Close modal
      setShowUploadModal(false);
      setUploadFile(null);
      setSelectedCategory(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const openUploadModal = (category) => {
    setSelectedCategory(category);
    setShowUploadModal(true);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Documents</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="h-[75vh] rounded-lg flex flex-col">
          <div className="flex-1 overflow-auto bg-white rounded-lg">
            <table className="min-w-full text-sm">
              <thead
                className="bg-white sticky top-0"
                style={{ boxShadow: "0 2px 0 black" }}
              >
                <tr>
                  <th className="p-5 text-left">S.No</th>
                  <th className="p-5 text-left">Category</th>
                  <th className="p-5 text-left">Date</th>
                  <th className="p-5 text-left">Upload</th>
                  <th className="p-5 text-left">View</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((cat, index) => {
                  const uploaded = userDocs.find(
                    (d) => d.category_id === cat.id
                  );

                  return (
                    <tr
                      key={cat.id}
                      className={(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}
                    >
                      <td className="px-5 py-4">{index + 1}</td>
                      <td className="px-5 py-4">{cat.category_name}</td>

                      <td className="px-5 py-4">
                        {uploaded?.doc_date || "NA"}
                      </td>

                      {/* Upload Icon */}
                      <td className="px-5 py-4">
                        <FaUpload
                          onClick={() => openUploadModal(cat)}
                          className="text-blue-600 cursor-pointer text-lg"
                        />
                      </td>

                      {/* View */}
                      <td className="px-5 py-4">
                        {uploaded?.doc_url ? (
                          <a href={uploaded.doc_url} target="_blank" rel="noreferrer">
                            <img src={pdf} alt="pdf" className="w-6 h-6" />
                          </a>
                        ) : (
                          "No File"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h2 className="text-lg font-semibold mb-4">
              Upload Document for: {selectedCategory?.category_name}
            </h2>

            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full border p-2 rounded mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>

              <button
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleUpload}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;