// EditCategoryModal.jsx

import { FaTrash } from "react-icons/fa";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

export default function EditCategoryModal({
  isOpen,
  onClose,
  category,
  existingFieldsFromDB,
  fetchCategories,
  JAVA_BASE,
  ASSET_NODE_BASE
}) {
  const modalRef = useRef();

  const PROTECTED_FIELDS = [
    "Asset Name",
    "Purchase Date",
    "Original Cost",
    "Scrap Value",
    "Useful Life",
    "Unit Of Measure",
  ];

  const [existingFields, setExistingFields] = useState([]);
  const [newFields, setNewFields] = useState([]);

  useEffect(() => {
    if (!isOpen || !category) return;

    setExistingFields(
      existingFieldsFromDB
        .filter((f) => f.categoryName === category.categoriesname)
        .map((f) => ({
          id: f.id,
          fieldname: f.fieldname,
          assetDataType: f.assetDataType,
          isNullable: f.isNullable,
          isUnique: f.isUnique,
        }))
    );

    setNewFields([
      {
        fieldname: "",
        assetDataType: "String",
        isUnique: false,
        isNullable: false,
      },
    ]);

  }, [isOpen, category]);

  // -----------------------------
  // Handle Field Updates
  // -----------------------------
  const handleNewFieldChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updated = [...newFields];
    updated[index][name] = type === "checkbox" ? checked : value;
    setNewFields(updated);
  };

  const addField = () => {
    setNewFields([
      ...newFields,
      {
        fieldname: "",
        assetDataType: "String",
        isUnique: false,
        isNullable: false,
      },
    ]);
  };

  const removeField = (index) => {
    setNewFields(newFields.filter((_, i) => i !== index));
  };

  // -----------------------------
  // Delete Existing Field (NO PAGE REFRESH)
  // -----------------------------
  const removeExistingField = async (id) => {
    const token = sessionStorage.getItem("token");

    try {
      await axios.delete(`${JAVA_BASE}api/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setExistingFields(existingFields.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // -----------------------------
  // Save as Draft
  // -----------------------------
  const handleDraft = async () => {
    const token = sessionStorage.getItem("token");

    const payload = {
      categoriesname: category.categoriesname,
      fields: {
        ...existingFields.reduce((acc, field) => {
          acc[field.fieldname] =
            field.assetDataType +
            (field.isUnique ? ", UNIQUE" : "") +
            (field.isNullable ? ", NULL" : "");
          return acc;
        }, {}),
        ...newFields.reduce((acc, field) => {
          if (!field.fieldname.trim()) return acc;
          acc[field.fieldname] =
            field.assetDataType +
            (field.isUnique ? ", UNIQUE" : "") +
            (field.isNullable ? ", NULL" : "");
          return acc;
        }, {}),
      },
    };

    try {
      await axios.post(`${JAVA_BASE}api/temp/save`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onClose();
      fetchCategories();
    } catch (err) {
      console.error("Save draft error:", err);
    }
  };

  // -----------------------------
  // Submit for Approval
  // -----------------------------
  const handleApproval = async () => {
    const token = sessionStorage.getItem("token");

    const temporaryData = {
      categoryName: category.categoriesname,
      assets: newFields.map((f) => ({
        fieldname: f.fieldname,
        assetDataType: f.assetDataType,
        isNullable: f.isNullable,
        isUnique: f.isUnique,
      })),
    };

    try {
      await axios.post(`${JAVA_BASE}api/assets/insert`, temporaryData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await axios.put(
        `${ASSET_NODE_BASE}assets/stages/${category.categoryId}`,
        { value: "SubmittedForApproval" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onClose();
      fetchCategories();
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-white p-6 rounded-lg w-11/12 md:w-3/4 lg:w-1/3 xl:w-1/2 shadow-lg">

        <h2 className="text-lg font-bold mb-4">Edit Category</h2>

        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-lg">Important Note:</h3>
          <p className="text-sm">
            Default fields cannot be edited or deleted.  
            New fields can be edited or deleted until saved.
          </p>
        </div>

        {/* CATEGORY NAME */}
        <div className="mb-4">
          <label className="font-semibold">Asset Category</label>
          <input
            type="text"
            value={category.categoriesname}
            disabled
            className="w-full p-2 border rounded-lg bg-gray-100"
          />
        </div>

        {/* FIELDS SECTION */}
        <div className="max-h-60 overflow-y-auto border p-4 rounded-lg">
          <label className="font-semibold">Form Fields</label>

          {/* EXISTING FIELDS */}
          {existingFields.map((field) => {
            const isProtected = PROTECTED_FIELDS.includes(field.fieldname);

            return (
              <div key={field.id} className="flex gap-3 mt-3">

                <input
                  value={field.fieldname}
                  disabled
                  className="p-2 border rounded-lg bg-gray-200 cursor-not-allowed flex-1"
                />

                <select disabled className="p-2 border rounded-lg bg-gray-200 cursor-not-allowed">
                  <option>{field.assetDataType}</option>
                </select>

                {!isProtected && (
                  <button
                    onClick={() => removeExistingField(field.id)}
                    className="text-red-500"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            );
          })}

          {/* NEW FIELDS */}
          {newFields.map((field, index) => (
            <div key={index} className="flex gap-3 mt-3">

              <input
                name="fieldname"
                value={field.fieldname}
                onChange={(e) => handleNewFieldChange(index, e)}
                placeholder="Field Name"
                className="p-2 border rounded-lg flex-1"
              />

              <select
                name="assetDataType"
                value={field.assetDataType}
                onChange={(e) => handleNewFieldChange(index, e)}
                className="p-2 border rounded-lg"
              >
                <option value="String">Alpha Numeric</option>
                <option value="Integer">Whole Number</option>
                <option value="Number">Decimal</option>
                <option value="Boolean">Yes/No</option>
                <option value="Date">Date</option>
                <option value="Json">Upload File</option>
              </select>

              <button
                onClick={() => removeField(index)}
                className="text-red-500"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between mt-5">
          <button onClick={addField} className="bg-red-600 text-white px-6 py-2 rounded-full">
            Add Field
          </button>

          <button onClick={handleDraft} className="bg-blue-600 text-white px-6 py-2 rounded-full">
            Save as Draft
          </button>

          <button onClick={handleApproval} className="bg-green-600 text-white px-6 py-2 rounded-full">
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}
