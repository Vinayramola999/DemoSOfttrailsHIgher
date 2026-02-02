const JobDetailsModal = ({ job, deptName, onClose }) => {
  const renderBulletPoints = (text) => {
    if (!text) return <span className="text-gray-500">NA</span>;
    return (
      <ul className="list-disc list-inside space-y-1 pl-4 text-gray-700">
        {text.split("\n").map((line, idx) => (
          <li key={idx}>{line.trim()}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-3">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide relative transition-all duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 hover:text-red-800 font-bold text-lg"
        >
          ❌
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Job Details
        </h2>

        {/* Job Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* Left Column */}
          <div>
            <p><strong>Title:</strong> {job.title}</p>
            <p><strong>Department:</strong> {deptName}</p>
            <p><strong>Work Mode:</strong> {job.work_mode}</p>
            <p><strong>Experience:</strong> {job.experience || "NA"}</p>
            <p><strong>Destination:</strong> {job.destination || "NA"}</p>
          </div>

          {/* Right Column */}
          <div>
            <p><strong>Location:</strong> {job.location || "NA"}</p>
            <p>
              <strong>Close Date:</strong>{" "}
              {job.close_date?.split("T")[0] || "NA"}
            </p>
            <p>
              <strong>Posted On:</strong>{" "}
              {job.created_at?.split("T")[0] || "NA"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`${job.status?.toLowerCase() === "active"
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
                  }`}
              >
                {job.status
                  ? job.status.charAt(0).toUpperCase() +
                  job.status.slice(1).toLowerCase()
                  : "NA"}
              </span>
            </p>
          </div>
        </div>

        {/* Section Divider */}
        <hr className="my-5 border-gray-300" />

        {/* Detailed Sections */}
        <div className="space-y-5 text-sm">
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Job Description</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-800 leading-relaxed whitespace-pre-line text-justify">
              {job.description || "NA"}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Eligibility</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              {renderBulletPoints(job.eligibility)}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Responsibilities</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              {renderBulletPoints(job.responsibilities)}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Skills</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              {renderBulletPoints(job.skills)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default JobDetailsModal;