import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const CustomerDataTable = ({ data = [], actions = {} }) => {
    const [expandedRows, setExpandedRows] = useState({});

    const toggleRow = (id) => {
        setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="flex flex-col rounded-lg w-full">
            {/* Table wrapper */}
            <div className="bg-white rounded-lg">
                {/* Scrollable container */}
                <div className="overflow-y-auto overflow-x-auto max-h-[60vh] custom-scrollbar">
                    <table className="min-w-full table-fixed border-collapse text-sm">
                        <thead
                            className="text-[14px] font-normal bg-white sticky top-0 z-20"
                            style={{ boxShadow: "0 2px 0 black" }}
                        >
                            <tr>
                                <th className="p-3 text-left text-black whitespace-nowrap" style={{ width: "80px" }}>S. No.</th>
                                <th className="p-3 text-left text-black whitespace-nowrap" style={{ width: "200px" }}>Customer</th>
                                <th className="p-3 text-left text-black whitespace-nowrap" style={{ width: "200px" }}>Email</th>
                                <th className="p-3 text-left text-black whitespace-nowrap" style={{ width: "150px" }}>Phone no.</th>
                                <th className="p-3 text-left text-black whitespace-nowrap" style={{ width: "150px" }}>Workflow</th>
                                <th className="p-3 text-left text-black whitespace-nowrap" style={{ width: "150px" }}>Date</th>
                                <th className="p-3 text-left text-black whitespace-nowrap" style={{ width: "150px" }}>Stage</th>
                                <th className="p-5 text-left text-black" style={{ width: "120px" }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td
                                    colSpan={8}
                                    className="h-3 bg-white"
                                ></td>
                            </tr>

                            {data.length > 0 ? (
                                data.map((item, index) => {
                                    const rowId = item.customer_id || index;
                                    return (
                                        <tr
                                            key={rowId}
                                            className={(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}
                                        >
                                            <td className="px-3 py-4 text-left text-[14px] text-black text-nowrap">
                                                {index + 1}
                                            </td>

                                            <td className="px-3 py-4 text-left text-[14px] text-black whitespace-normal break-words">
                                                {(() => {
                                                    const name = item.customer_name || "NA";
                                                    const LIMIT = 15;
                                                    const isExpanded = expandedRows[rowId];
                                                    const showReadMore = name.length > LIMIT;

                                                    return (
                                                        <>
                                                            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                                                                {isExpanded || !showReadMore
                                                                    ? name
                                                                    : name.substring(0, LIMIT) + "..."}
                                                            </span>
                                                            {showReadMore && (
                                                                <button
                                                                    className="text-blue-600 font-medium text-sm ml-1"
                                                                    onClick={() => toggleRow(rowId)}
                                                                >
                                                                    {isExpanded ? "Read less" : "Read more"}
                                                                </button>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </td>

                                            <td className="px-3 py-4 text-left text-[14px] text-black text-nowrap">
                                                <div className="overflow-hidden block truncate" title={item.email_id}>
                                                    {item.email_id || "NA"}
                                                </div>
                                            </td>

                                            <td className="px-3 py-4 text-left text-[14px] text-black text-nowrap">
                                                {item.phone_number || "NA"}
                                            </td>

                                            <td className="px-3 py-4 text-left text-[14px] text-black text-nowrap">
                                                NA
                                            </td>

                                            <td className="px-3 py-4 text-left text-[14px] text-black text-nowrap">
                                                {item.created_at?.split("T")[0] || "NA"}
                                            </td>

                                            <td className="px-3 py-4 text-left text-[14px] text-black text-nowrap">
                                                <span className="bg-yellow-200 text-yellow-700 px-3 py-1 rounded-full text-sm">
                                                    {item.stage || "NA"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-left text-[14px] text-black">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => actions?.edit?.(item)}
                                                        className="text-blue-600 hover:text-blue-800 hover:opacity-80 transition-all duration-200"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>

                                                    <button
                                                        onClick={() => actions?.delete?.(item)}
                                                        className="text-red-600 hover:text-red-800 hover:opacity-80 transition-all duration-200"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="p-4 text-center text-gray-500"
                                    >
                                        No matching data found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerDataTable;
