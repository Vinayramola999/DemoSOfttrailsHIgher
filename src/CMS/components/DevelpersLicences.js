import React, { useEffect, useState } from "react";
import Select from "react-select";

export default function DevelpersLicences() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [subModules, setSubModules] = useState([]);
  const [error, setError] = useState("");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "https://saaspro.softtrails.net/cms/pro/publish/retriveContent"
        );
        const data = await res.json();

        if (data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setError("Unexpected API response format.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products. Please check the server.");
      }
    };

    fetchProducts();
  }, []);

  // Handle selection
  const handleSelect = (option) => {
    setSelectedProduct(option);
    const found = products.find((p) => p.product_id === option?.value);
    setSubModules(found?.sub_modules || []);
  };

  const options = products.map((p) => ({
    value: p.product_id,
    label: p.product_name,
    license_id: p.license_id?.trim(),
  }));

  return (
    <div className="p-[1px] bgre">
      {/* Fixed Header with Product Selector */}
      <div className="fixed bg-[#FAF9F6] w-full">
        <p className="text-gray-700 font-medium pt-2 py-2">Product</p>
        <div className="w-[300px] border border-[#D1D5DB] rounded-lg">
          <Select
            options={options}
            value={selectedProduct}
            onChange={handleSelect}
            placeholder="Search or select a product..."
            isSearchable
          />
        </div>
      </div>

      {/* Product & Submodules Section */}
      {selectedProduct && (
        <div className="bg-white mt-24 px-6 py-4 border border-gray-300 rounded-lg w-[550px] overflow-y-scroll scrollbar-hide mb-28 shadow-sm">
          {/* Product Info */}
          <div className="mb-2">
            <p className="font-semibold text-[#111827]">
              {selectedProduct.label}
            </p>
          </div>
          <div className="mb-2">
            <p className="text-[#6B7280]">
              <span>Product ID:</span> {selectedProduct.value}
            </p>
            <p className="text-[#6B7280]">
              <span>Licence ID:</span> {selectedProduct.license_id}
            </p>
          </div>

          {/* Submodules Display */}
          <div className="mt-5">
            <h4 className="font-medium text-[#111827] my-2">
              Existing Licence Parameters
            </h4>

            {subModules && subModules.length > 0 ? (
              subModules.map((sub, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                >
                  <div className="flex justify-between items-center mb-2">
                    {/* Website Field */}
                    <div>
                      <label className="text-[#6B7280] text-[10px]">
                        On Website
                      </label>
                      <p className="text-sm font-medium">{sub.sub_module}</p>
                    </div>

                    {/* Developer Field */}
                    <div>
                      <label className="text-[#6B7280] text-[10px]">
                        For Developers
                      </label>
                      <p className="text-sm font-medium">{sub.sub_lic ?? ""}</p>
                    </div>

                    {/* Active/Inactive */}
                    <div>
                      {sub.checked ? (
                        <p className="px-3 py-1 bg-[#DCFCE7] w-16 flex items-center justify-center rounded-full">
                          <span className="text-[10px] font-medium text-[#166534]">
                            Active
                          </span>
                        </p>
                      ) : (
                        <p className="px-3 py-1 bg-[#f447471c] w-16 flex items-center justify-center rounded-full">
                          <span className="text-[10px] font-medium text-[#e41919]">
                            Inactive
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic mt-3">
                No Licence found for this product.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
