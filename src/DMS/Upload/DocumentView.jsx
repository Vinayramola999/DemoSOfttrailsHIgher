import React, { useState, useEffect } from "react";
import { fetchFolderData } from "../service/FolderView";

const FolderView = () => {
  const [path, setPath] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentPrefix = `./${path.join("/")}${path.length > 0 ? "/" : ""}`;
  const token = sessionStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchFolderData(token, currentPrefix);
        setFolders(data.folders || []);
        setFiles(data.files || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [path, token, currentPrefix]);

  const handleFolderClick = (folderName) => {
    setPath([...path, folderName]);
    setSearchQuery("");
  };
  const handleBreadcrumbClick = (index) => {
    setPath(path.slice(0, index));
  };
  const handleRootClick = () => {
    setPath([]);
  };
  const handleBackClick = () => {
    if (path.length > 0) {
      setPath(path.slice(0, path.length - 1));
    }
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-md border border-gray-300 h-[820px] overflow-y-auto">
      <div className="flex">
        <h2 className="text-lg font-bold mb-4 text-blue-800">View Documents</h2>
      </div>

      <div className="max-w-8xl mx-auto p-4 font-sans">
        <div className="mb-4 flex flex-wrap space-x-2 text-blue-600 text-lg">
          <span
            className="cursor-pointer hover:underline"
            onClick={handleRootClick}
          >
            Root
          </span>
          {path.map((name, i) => (
            <React.Fragment key={i}>
              <span>{">"}</span>
              <span
                className="cursor-pointer hover:underline"
                onClick={() => handleBreadcrumbClick(i + 1)}
              >
                {name}
              </span>
            </React.Fragment>
          ))}
        </div>
        {path.length > 0 && (
          <div className="mb-4">
            <button
              onClick={handleBackClick}
              className="bg-gray-100 hover:bg-gray-200 rounded px-3 py-1 text-gray-700 flex items-center space-x-1"
            >
              <span>←</span> <span>Back</span>
            </button>
          </div>
        )}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search folders and files..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-3/12 rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {loading && <div>Loading...</div>}

        {!loading && (
          <>
            {filteredFolders.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {filteredFolders.map((folder, index) => (
                  <div
                    key={index}
                    className="p-3 rounded border hover:border-blue-500 cursor-pointer flex flex-col items-center"
                    onClick={() => handleFolderClick(folder.name)}
                  >
                    <span className="text-3xl">📁</span>
                    <span>{folder.name}</span>
                  </div>
                ))}
              </div>
            )}

            {filteredFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-bold">Files</h3>
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-lg">
                  {filteredFiles.map((file, idx) => (
                    <li key={idx}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-lg"
                      >
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {filteredFolders.length === 0 &&
              filteredFiles.length === 0 &&
              !loading && (
                <div className="text-gray-500">
                  No results found in this directory.
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default FolderView;
