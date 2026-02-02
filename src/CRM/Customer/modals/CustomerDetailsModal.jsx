import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const CustomerDetailsModal = ({
  isOpen,
  customer,
  contacts,
  loadingContacts,
  onClose,
  onEditContact,
  onDeleteContact,
  hasAMSAccessEditContact,
  hasAMSAccessDeleteContact,
  onContactClick,
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="relative flex justify-between items-center px-5 py-3 bg-white border-b border-gray-300">
          <h2 className="text-gray-800 font-semibold text-base">
            Customer Details
          </h2>

          <button
            onClick={onClose}
            className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 1L12 12M12 1L1 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Customer Info Section */}
        <div className="bg-gray-50 border-b border-gray-300 px-5 py-4">
          {/* Desktop Grid - Matching the exact layout specified */}
          <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-sm">
            {/* Row 1 - Customer Name, Workflow, Phone */}
            <div className="text-gray-500">
              <span className="text-gray-900 font-semibold text-xl">{customer.customer_name}</span>
            </div>
            <div className="text-gray-500">
              <div className="text-gray-500">
                Workflow:{" "}
                <span className="text-gray-900 font-medium">
                  {customer.workflow || ""}
                  {customer.workflow_id ? ` ${customer.workflow_id}` : ""}
                </span>
              </div>

            </div>
            <div className="text-gray-500">
              Phone No.: <span className="text-gray-900 font-medium">{customer.phone_number || "N/A"}</span>
            </div>

            {/* Row 2 - Email, Address, Country */}
            <div className="text-gray-500">
              Email: <span className="text-gray-900 font-medium">{customer.email_id || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              Industry: <span className="text-gray-900 font-medium">{customer.industry || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              Address: <span className="text-gray-900 font-medium">{customer.address || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              Country: <span className="text-gray-900 font-medium">{customer.country || "N/A"}</span>
            </div>

            {/* Row 3 - State, City, Pin Code */}
            <div className="text-gray-500">
              State: <span className="text-gray-900 font-medium">{customer.state || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              City: <span className="text-gray-900 font-medium">{customer.city || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              Pin Code: <span className="text-gray-900 font-medium">{customer.pincode || "N/A"}</span>
            </div>

            {/* Row 4 - GST, PAN, TAN */}
            <div className="text-gray-500">
              GST No.: <span className="text-gray-900 font-medium">{customer.gst_number || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              PAN No.: <span className="text-gray-900 font-medium">{customer.pan_no || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              TAN No.: <span className="text-gray-900 font-medium">{customer.tan_number || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="flex-1 overflow-hidden flex flex-col px-5 py-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-sm text-black">
              Contact Details {contacts && contacts.filter(c => c.customer_id === customer.customer_id).length > 0 &&
                `(${contacts.filter(c => c.customer_id === customer.customer_id).length})`}
            </h4>
          </div>

          {/* Contact Table Container */}
          <div className="flex-1 overflow-auto">
            {loadingContacts ? (
              <p className="text-gray-600">Loading contact details...</p>
            ) : Array.isArray(contacts) && contacts.length > 0 ? (
              <div className="min-w-full">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="min-w-full border-collapse">
                        {/* Sticky Table Header */}
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-gray-500">
                            <th className="px-3 py-2 text-left text-white text-xs font-medium">Sr. no.</th>
                            <th className="px-3 py-2 text-left text-white text-xs font-medium">Contact person</th>
                            <th className="px-3 py-2 text-left text-white text-xs font-medium">Email</th>
                            <th className="px-3 py-2 text-left text-white text-xs font-medium">Phone no.</th>
                            <th className="px-3 py-2 text-left text-white text-xs font-medium">Status</th>
                            <th className="px-3 py-2 text-left text-white text-xs font-medium">Action</th>
                          </tr>
                        </thead>

                        {/* Scrollable Table Body */}
                        <tbody className="bg-white">
                          {contacts
                            .filter((contact) => contact.customer_id === customer.customer_id)
                            .map((contact, index) => (
                              <tr key={contact.contact_id || index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-1 text-xs font-medium text-black">
                                  {index + 1}.
                                </td>
                                <td className="px-3 py-1">
                                  <span
                                    className="text-xs font-medium text-black cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => onContactClick && onContactClick(contact)}
                                  >
                                    {contact.contact_person}
                                  </span>
                                </td>
                                <td className="px-3 py-1 text-xs font-medium text-black truncate" title={contact.email_id}>
                                  {contact.email_id}
                                </td>
                                <td className="px-3 py-1 text-xs font-medium text-black">
                                  {contact.phone_num}
                                </td>
                                <td className="px-3 py-1 text-xs font-medium text-black">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${contact.status?.toLowerCase() === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                    }`}>
                                    {contact.status}
                                  </span>
                                </td>
                                <td className="px-3 py-1">
                                  <div className="flex items-center space-x-2">
                                    {hasAMSAccessEditContact && (
                                      <button
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-all"
                                        onClick={() => onEditContact && onEditContact(contact.contact_id)}
                                        aria-label="Edit Contact"
                                      >
                                        <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {hasAMSAccessDeleteContact && (
                                      <button
                                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-all"
                                        onClick={() => onDeleteContact && onDeleteContact(contact.contact_id)}
                                        aria-label="Delete Contact"
                                      >
                                        <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Show scroll indicator if there are many contacts */}
                    {contacts && contacts.filter(c => c.customer_id === customer.customer_id).length > 10 && (
                      <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-t text-center">
                        Scroll to see more contacts
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 max-h-96 overflow-y-auto">
                  {contacts
                    .filter((contact) => contact.customer_id === customer.customer_id)
                    .map((contact, index) => (
                      <div key={contact.contact_id || index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-medium text-sm flex-1 min-w-0">
                            <span className="text-gray-500 mr-2 text-xs">{index + 1}.</span>
                            <span
                              className="text-black cursor-pointer hover:text-blue-600 transition-colors break-words"
                              onClick={() => onContactClick && onContactClick(contact)}
                            >
                              {contact.contact_person}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 ml-2 flex-shrink-0">
                            {hasAMSAccessEditContact && (
                              <button
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all p-1.5 rounded"
                                onClick={() => onEditContact && onEditContact(contact.contact_id)}
                                aria-label="Edit Contact"
                              >
                                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                              </button>
                            )}
                            {hasAMSAccessDeleteContact && (
                              <button
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 transition-all p-1.5 rounded"
                                onClick={() => onDeleteContact && onDeleteContact(contact.contact_id)}
                                aria-label="Delete Contact"
                              >
                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="font-medium text-gray-800 min-w-0 sm:w-16 flex-shrink-0">Email:</span>
                            <span className="ml-0 sm:ml-1 break-all">{contact.email_id}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="font-medium text-gray-800 min-w-0 sm:w-16 flex-shrink-0">Phone:</span>
                            <span className="ml-0 sm:ml-1">{contact.phone_num}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="font-medium text-gray-800 min-w-0 sm:w-16 flex-shrink-0">Status:</span>
                            <span className={`ml-0 sm:ml-1 px-2 py-1 rounded-full text-xs font-medium inline-block ${contact.status?.toLowerCase() === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {contact.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Show contact count for mobile */}
                  {contacts && contacts.filter(c => c.customer_id === customer.customer_id).length > 5 && (
                    <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 text-center rounded-lg border">
                      Showing {contacts.filter(c => c.customer_id === customer.customer_id).length} contacts total
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No contact details available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;