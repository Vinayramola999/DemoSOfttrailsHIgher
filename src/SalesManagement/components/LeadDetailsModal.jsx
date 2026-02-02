import React from 'react';
import { X } from 'lucide-react';
import Select from 'react-select';

// UI-only Lead Details / Edit modal. Logic stays in parent component.
export default function LeadDetailsModal({
  visible,
  selectedLeadData,
  modalMode,
  onClose,
  onVerify,
  onSave,
  editedKAM,
  setEditedKAM,
  kamUsers,
}) {
  if (!visible || !selectedLeadData) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-lg w-[500px]">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b">
          <h2 className="text-lg font-semibold">{modalMode === 'edit' ? 'Edit Lead' : 'Lead Details'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body - Scrollable Content */}
        <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
          <div className="px-5 py-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Customer UID</label>
              <div className="w-full p-2 border rounded bg-gray-50">{selectedLeadData.customer_uid || '-'}</div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Lead</label>
              <div className="w-full p-2 border rounded bg-gray-50">{selectedLeadData.service}</div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <div className="w-full p-2 border rounded bg-gray-50">{selectedLeadData.created_at ? new Date(selectedLeadData.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <div className="w-full p-2 border rounded bg-gray-50">{selectedLeadData.source || '-'}</div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">KAM</label>
              {modalMode === 'edit' ? (
                <Select
                  name="kam"
                  value={kamUsers
                    .map(user => ({
                      value: user.user_id,
                      label: `${user.first_name} ${user.last_name}`
                    }))
                    .find(option => String(option.value) === String(editedKAM)) || null}
                  onChange={(option) => setEditedKAM(option ? option.value : "")}
                  options={kamUsers.map(user => ({
                    value: user.user_id,
                    label: `${user.first_name} ${user.last_name}`
                  }))}
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable
                  isSearchable
                  placeholder="Select KAM"
                />
              ) : (
                <div className="w-full p-2 border rounded bg-gray-50">{selectedLeadData.kam_name || selectedLeadData.name || '-'}</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="w-full p-2 border rounded bg-gray-50">{selectedLeadData.status || '-'}</div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Remark</label>
              <div className="w-full p-2 border rounded bg-gray-50 min-h-[75px] whitespace-pre-line">{selectedLeadData.remark || selectedLeadData.messages || 'No remarks provided.'}</div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="flex items-center justify-between px-5 py-4 border-t bg-white">
          {/* Cancel on the left (outlined) */}
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            Cancel
          </button>

          <div className="flex items-center">
            {/* Right-side primary action */}
            {modalMode === 'verify' && (
              <button
                onClick={() => onVerify(selectedLeadData.lead_id)}
                className="ml-4 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
              >
                Verify Lead
              </button>
            )}

            {modalMode === 'edit' && (
              <button
                onClick={() => onSave(selectedLeadData.lead_id)}
                className="ml-4 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
