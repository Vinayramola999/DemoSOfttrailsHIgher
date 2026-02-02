import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CustomerTable = ({
  data = [],
  columns = [],
  currentPage = 1,
  pageSize = 25,
  actions = []
}) => {
  return (
    <div className="flex flex-col rounded-lg w-full">

      {/* Table wrapper */}
      <div className="bg-white rounded-lg">

        {/* Scrollable container */}
        <div className="overflow-y-auto overflow-x-auto max-h-[50vh] custom-scrollbar">

          <table className="min-w-full table-fixed border-collapse text-sm">

            <thead
              className="text-[14px] font-normal bg-white sticky top-0 z-20"
              style={{ boxShadow: "0 2px 0 black" }}
            >
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="p-3 text-left text-black whitespace-nowrap"
                    style={{ width: "150px" }} // ← fixed width
                  >
                    {col.label}
                  </th>
                ))}

                {actions.length > 0 && (
                  <th
                    className="p-5 text-left text-black"
                    style={{ width: "120px" }} // ← fixed width for actions
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="h-3 bg-white"
                ></td>
              </tr>

              {data.length > 0 ? (
                data.map((item, i) => (
                  <tr
                    key={item.customer_id ?? item.contact_id ?? i}
                    className={(i + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}
                  >
                    {columns.map((col, cidx) => (
                      <td
                        key={cidx}
                        className="px-3 py-4 text-left text-[14px] text-black text-nowrap"
                        style={{ width: col.width || "150px" }} // ← fixed width
                      >
                        <div className="overflow-hidden">
                          {col.render ? (
                            col.render(item, i)
                          ) : col.key ? (
                            <span className="block truncate" title={item[col.key]}>
                              {item[col.key] ?? "NA"}
                            </span>
                          ) : null}
                        </div>
                      </td>
                    ))}

                    {actions.length > 0 && (
                      <td
                        className="px-5 py-4 text-left text-[14px] text-black"
                        style={{ width: "120px" }} // ← fixed width
                      >
                        <div className="flex items-center gap-3">
                          {actions.map((action, aIdx) =>
                            action.show ? (
                              <button
                                key={aIdx}
                                onClick={() => action.onClick(item, i)}
                                className={`hover:opacity-80 transition-all duration-200 ${action.color ?? ""}`}
                                title={action.label}
                              >
                                {typeof action.icon === "function" ? (
                                  <action.icon />
                                ) : (
                                  <FontAwesomeIcon icon={action.icon} />
                                )}
                              </button>
                            ) : null
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
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

export default CustomerTable;
