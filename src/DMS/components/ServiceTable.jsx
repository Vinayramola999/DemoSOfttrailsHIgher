import { useState, useEffect } from "react";

const ServiceTable = ({ services, handleDelete }) => {
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const rowsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(services.length / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [services.length]);

  const paginatedServices = services.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex flex-col h-[570px] bg-white rounded-md">
      <div className="overflow-auto flex-grow ">
        <table className="min-w-full text-sm">
          <thead className="text-black font-medium border-b border-black">
            <tr className="h-16">
              <th className="px-4 py-4 text-left">S. No.</th>
              <th className="px-4 py-4 text-left">Service</th>
              <th className="px-4 py-4 text-left">Date</th>
              <th className="px-4 py-4 text-left">Description</th>
              <th className="px-4 py-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-3"></tr>
            {paginatedServices.length > 0 ? (
              paginatedServices.map((service, index) => (
                <tr
                  key={service.id}
                  className="hover:bg-gray-50 transition border-b odd:bg-white even:bg-blue-100 h-14"
                >
                  <td className="px-4 py-3">
                    {(currentPage - 1) * rowsPerPage + index + 1}.
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-600">
                    {service.name}
                  </td>
                  <td className="px-4 py-3">
                    {service.created_at.split("T")[0]}
                  </td>
                  <td className="px-4 py-3">{service.description}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteTargetId(service.id);
                      }}
                    >
                      <svg
                        width="16"
                        height="18"
                        viewBox="0 0 16 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.6667 3.16406C14.8877 3.16406 15.0996 3.25186 15.2559 3.40814C15.4122 3.56442 15.5 3.77638 15.5 3.9974C15.5 4.21841 15.4122 4.43037 15.2559 4.58665C15.0996 4.74293 14.8877 4.83073 14.6667 4.83073H13.8333L13.8308 4.8899L13.0533 15.7824C13.0234 16.2029 12.8352 16.5964 12.5268 16.8837C12.2183 17.171 11.8124 17.3307 11.3908 17.3307H4.60833C4.18678 17.3307 3.78089 17.171 3.4724 16.8837C3.16392 16.5964 2.97576 16.2029 2.94583 15.7824L2.16833 4.89073L2.16667 4.83073H1.33333C1.11232 4.83073 0.900358 4.74293 0.744078 4.58665C0.587797 4.43037 0.5 4.21841 0.5 3.9974C0.5 3.77638 0.587797 3.56442 0.744078 3.40814C0.900358 3.25186 1.11232 3.16406 1.33333 3.16406H14.6667ZM9.66667 0.664062C9.88768 0.664063 10.0996 0.75186 10.2559 0.90814C10.4122 1.06442 10.5 1.27638 10.5 1.4974C10.5 1.71841 10.4122 1.93037 10.2559 2.08665C10.0996 2.24293 9.88768 2.33073 9.66667 2.33073H6.33333C6.11232 2.33073 5.90036 2.24293 5.74408 2.08665C5.5878 1.93037 5.5 1.71841 5.5 1.4974C5.5 1.27638 5.5878 1.06442 5.74408 0.90814C5.90036 0.75186 6.11232 0.664063 6.33333 0.664062H9.66667Z"
                          fill="#E33629"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-4 text-gray-500 font-medium"
                >
                  No services found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 flex justify-center items-center gap-2 select-none py-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`w-9 h-9 flex items-center justify-center rounded-md border ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-200"
          }`}
        >
          &#x2039;
        </button>

        <button className="w-9 h-9 flex items-center justify-center rounded-md border bg-blue-600 text-white font-semibold">
          {currentPage}
        </button>

        <span className="text-sm font-medium text-gray-600">of</span>

        <button className="w-9 h-9 flex items-center justify-center rounded-md border text-blue-600 border-blue-500 font-semibold">
          {totalPages}
        </button>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`w-9 h-9 flex items-center justify-center rounded-md border ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-200"
          }`}
        >
          &#x203A;
        </button>
      </div>

      {deleteTargetId && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-3xl w-max max-w-4xl relative flex flex-col items-center border border-black">
            <svg
              width="22"
              height="28"
              viewBox="0 0 22 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 24.5C2 26.15 3.35 27.5 5 27.5H17C18.65 27.5 20 26.15 20 24.5V9.5C20 7.85 18.65 6.5 17 6.5H5C3.35 6.5 2 7.85 2 9.5V24.5ZM20 2H16.25L15.185 0.935C14.915 0.665 14.525 0.5 14.135 0.5H7.865C7.475 0.5 7.085 0.665 6.815 0.935L5.75 2H2C1.175 2 0.5 2.675 0.5 3.5C0.5 4.325 1.175 5 2 5H20C20.825 5 21.5 4.325 21.5 3.5C21.5 2.675 20.825 2 20 2Z"
                fill="red"
              />
            </svg>
            <h1 className="text-4xl py-6 text-red-700 font-bold">
              Confirm Delete?
            </h1>
            <p className="text-xl text-gray-700 pb-6 text-center">
              Are you sure you want to delete this service?
            </p>
            <div className="flex gap-4 justify-center pt-4 w-full">
              <button
                className="border border-black hover:bg-red-500 hover:text-white text-black px-6 py-2 rounded-md text-lg w-1/2"
                onClick={() => setDeleteTargetId(null)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-lg w-1/2"
                onClick={() => {
                  handleDelete(deleteTargetId);
                  setDeleteTargetId(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTable;
