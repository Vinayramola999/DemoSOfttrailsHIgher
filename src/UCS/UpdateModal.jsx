import React, { useState, useEffect } from 'react';

const UpdateModal = ({ show, onClose, data, onSave }) => {
  // Modal के अंदर फॉर्म के डेटा को मैनेज करने के लिए स्टेट
  const [formData, setFormData] = useState({});

  // जब भी data prop बदलता है (जब यूजर किसी रो पर क्लिक करता है), तो फॉर्म का डेटा अपडेट करें
  useEffect(() => {
    // सुनिश्चित करें कि डेटा null न हो
    if (data) {
      setFormData(data);
    }
  }, [data]);

  // अगर show false है, तो Modal को रेंडर न करें
  if (!show) {
    return null;
  }

  // इनपुट फील्ड में बदलाव को हैंडल करने के लिए फंक्शन
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // सेव बटन पर क्लिक को हैंडल करें
  const handleSave = () => {
    onSave(formData);
  };

  return (
    // Modal का बैकग्राउंड (overlay)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Modal का कंटेंट */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Update Module</h2>
        
        {/* Update Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Application Name</label>
            <input
              type="text"
              name="applicationName"
              value={formData.applicationName || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Module Name</label>
            <input
              type="text"
              name="moduleName"
              value={formData.moduleName || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sub Module Name</label>
            <input
              type="text"
              name="subModuleName"
              value={formData.subModuleName || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unique Identifier</label>
            <input
              type="text"
              name="uniqueIdentifierName"
              value={formData.uniqueIdentifierName || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        {/* Modal के बटन */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded-md text-black hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 px-4 py-2 rounded-md text-white hover:bg-blue-600 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;