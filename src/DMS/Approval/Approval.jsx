import { useEffect, useState } from "react";
import { fetchServices } from "../service/Setup";
import SearchableDropdown from "../components/SearchableDropdown";
import { fetchServiceData, fetchUserDocuments } from "../service/approval";
import UsersTable from "../components/UsersTable";
import DocumentDetailsModal from "../components/DocumentDetailsModal";
import DocumentsTable from "../components/DocumentsTable";

export default function Approval() {
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentsList, setDocumentsList] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    userId: "",
    docCount: "",
    appCount: "",
    applicationStatus: "",
  });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDocumentDetailsOpen, setIsDocumentDetailsOpen] = useState(false);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    handleFetchServiceOptions();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      handleFetchServiceData();
    }
  }, [selectedServiceId]);

  const handleFetchServiceData = async () => {
    try {
      const data = await fetchServiceData(token, selectedServiceId);
      const users = Array.isArray(data?.users) ? data.users : [];
      setUsersList(users);
      setSelectedUser(users);
    } catch (error) {
      setUsersList([]);
      setSelectedUser([]);
    }
  };

  const handleFetchServiceOptions = async () => {
    try {
      const data = await fetchServices(token);
      setServiceOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      setServiceOptions([]);
    }
  };

  const handleFetchDocuments = async (userId) => {
    setSelectedUserId(userId);
    setLoadingDocuments(true);
    try {
      const data = await fetchUserDocuments(token, selectedServiceId, userId);
      const selectedUserData = data?.users?.find((u) => u.user_id === userId);
      setDocumentsList(
        Array.isArray(selectedUserData?.documents)
          ? selectedUserData.documents
          : []
      );
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocumentsList([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleFind = async () => {
    if (selectedUserId) {
      await handleFetchDocuments(selectedUserId);
    }
  };

  const filteredUsers = Array.isArray(selectedUser)
    ? selectedUser.filter((user) => {
        const matchName = user.full_name
          ?.toLowerCase()
          .includes(searchFilters.name.toLowerCase());
        const matchUserId = user.user_id
          ?.toString()
          .includes(searchFilters.userId);
        const matchDocCount = user.documents_count
          ?.toString()
          .includes(searchFilters.docCount);
        const matchAppCount = user.approval_needed_count
          ?.toString()
          .includes(searchFilters.appCount);
        const matchStatus =
          searchFilters.applicationStatus === "" ||
          user.application_status?.toLowerCase() ===
            searchFilters.applicationStatus.toLowerCase();

        return (
          matchName &&
          matchUserId &&
          matchDocCount &&
          matchAppCount &&
          matchStatus
        );
      })
    : [];

  const handleRefresh = async () => {
    if (selectedUserId) {
      await handleFetchDocuments(selectedUserId);
    }
    await handleFetchServiceData();
  };

  

  return (
    <>
      <div className="bg-white p-6 rounded-md border border-gray-300 mb-4">
        <div className="flex">
          <h2 className="text-lg font-bold mb-4 text-blue-800">
            Document Approval
          </h2>
        </div>
        <div className="flex gap-4">
          <div>
            <SearchableDropdown
              options={serviceOptions}
              placeholder="Select Service"
              onSelect={({ id }) => {
                setSelectedServiceId(id);
              }}
            />
          </div>
          <div>
            <SearchableDropdown
              options={usersList.map((user) => ({
                id: user.user_id,
                name: `${user.full_name}`,
              }))}
              placeholder="Select User"
              onSelect={({ id }) => {
                setSelectedUserId(id);
              }}
            />
          </div>
          <button
            onClick={handleFind}
            disabled={!selectedUserId}
            className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md text-sm"
          >
            Find
          </button>
        </div>
      </div>

      {usersList.length >= 0 && (
        <div className=" mb-4">
          <div className="flex gap-4">
            <div className="">
              <input
                type="text"
                placeholder="Search by Name"
                value={searchFilters.name}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, name: e.target.value })
                }
                className="w-60 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="">
              <input
                type="text"
                placeholder="Search by User ID"
                value={searchFilters.userId}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, userId: e.target.value })
                }
                className="w-60 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="">
              <input
                type="text"
                placeholder="Search by Doc Count"
                value={searchFilters.docCount}
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    docCount: e.target.value,
                  })
                }
                className="w-60 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="">
              <input
                type="text"
                placeholder="Search by Approval Docs Count"
                value={searchFilters.appCount}
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    appCount: e.target.value,
                  })
                }
                className="w-60 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="">
              <select
                value={searchFilters.applicationStatus}
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    applicationStatus: e.target.value,
                  })
                }
                className="w-60 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={() =>
                setSearchFilters({
                  name: "",
                  userId: "",
                  docCount: "",
                  appCount: "",
                  applicationStatus: "",
                })
              }
              className="px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {usersList.length >= 0 && (
        <UsersTable users={filteredUsers} onUserClick={handleFetchDocuments} />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-7xl max-h-[85vh] overflow-hidden">
            <div className="bg-white px-6 py-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
              <DocumentsTable
                documents={documentsList}
                loading={loadingDocuments}
                onViewDocument={(doc) => {
                  setSelectedDocument(doc);
                  setIsDocumentDetailsOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <DocumentDetailsModal
        isOpen={isDocumentDetailsOpen}
        onClose={() => {
          setIsDocumentDetailsOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
        onUpdate={handleRefresh}
      />
    </>
  );
}
