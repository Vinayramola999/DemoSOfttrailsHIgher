import React, { useEffect, useState } from "react";

export default function Sett() {
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetch("http://13.204.15.86:3008/publish/retriveContent")
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error);

    fetch("http://13.204.15.86:9989/api/license-plans")
      .then((res) => res.json())
      .then((data) => setPlans(data.data || []))
      .catch(console.error);
  }, []);

  return (
    <div>
      <div className="z-10 bg-[#FAF9F6] py-4 fixed w-full">
        <div className="flex flex-wrap gap-3">
          {products.map((product, idx) => (
            <button
              key={product.product_id || idx}
              onClick={() => setActiveTab(idx)}
              className={`cursor-pointer py-2 px-6 rounded-full text-sm font-medium transition ${
                idx === activeTab
                  ? "bg-gradient-to-r from-[#005AE6] to-[#003280] text-white"
                  : "text-black"
              }`}
            >
              {product.product_name}
            </button>
          ))}
        </div>
      </div>

      <div className="py-32">
        {products[activeTab] && (
          <>
            <h3 className="font-semibold mb-3 text-[#0FB900]">
              Published Plans
            </h3>
            <div className="space-y-4 mb-8">
              {plans
                .filter((p) => p.visibility && p.publish)
                .map((plan) => (
                  <div
                    key={plan.id}
                    className="relative border rounded-2xl p-5 shadow-sm w-[1000px] bg-white"
                  >
                    <h4 className="text-lg font-semibold">{plan.planName}</h4>
                    <div className="flex flex-wrap gap-6 text-sm font-medium mt-2">
                      <p>
                        Number of submodules:
                        <span className="font-semibold text-blue-600 ml-1">
                          5
                        </span>
                      </p>
                      <p>
                        Duration:
                        <span className="font-semibold text-blue-600 ml-1">
                          30 days
                        </span>
                      </p>
                      <p>
                        Pricing:
                        <span className="font-semibold text-blue-600 ml-1">
                          ₹0
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <h3 className="font-semibold mb-3 text-red-600">
              Unpublished Plans
            </h3>
            <div className="space-y-4">
              {plans
                .filter((p) => !p.visibility || !p.publish)
                .map((plan) => (
                  <div
                    key={plan.id}
                    className="relative border rounded-2xl p-5 shadow-sm w-[1000px] bg-gray-50"
                  >
                    <button className="absolute top-3 right-3 bg-[#F2F2F2] p-2 rounded-full shadow hover:scale-110 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="none"
                          stroke="#000"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1"
                          d="m5 16l-1 4l4-1L19.586 7.414a2 2 0 0 0 0-2.828l-.172-.172a2 2 0 0 0-2.828 0zM15 6l3 3m-5 11h8"
                        />
                      </svg>
                    </button>
                    <h4 className="text-lg font-semibold">{plan.planName}</h4>
                    <div className="flex flex-wrap gap-6 text-sm font-medium mt-2">
                      <p>
                        Number of submodules:
                        <span className="font-semibold text-blue-600 ml-1">
                          4
                        </span>
                      </p>
                      <p>
                        Duration:
                        <span className="font-semibold text-blue-600 ml-1">
                          30 days
                        </span>
                      </p>
                      <p>
                        Pricing:
                        <span className="font-semibold text-blue-600 ml-1">
                          ₹0
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
