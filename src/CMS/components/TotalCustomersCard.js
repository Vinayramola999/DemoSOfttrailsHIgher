import React, { useEffect, useState } from "react";
import { MdPeopleOutline } from "react-icons/md";

export default function TotalCustomersCard() {
  const [totalCustomers, setTotalCustomers] = useState(null);

  useEffect(() => {
    fetch("https://devdemo.softtrails.net/customers//")
      .then((res) => res.json())
      .then((data) => {
        // Access totalCount from the nested data structure
        setTotalCustomers(data.data?.totalCount || 0);
      })
      .catch(() => setTotalCustomers(0));
  }, []);

  return (
    <div className=" p-5 bg-white rounded-lg shadow-md w-[240px]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[#6B7280] text-[12px] font-medium ">
            Total Customers
          </p>
          <p className="text-[#1F2937] text-[20px] font-semibold">
            {totalCustomers !== null ? totalCustomers : "Loading..."}
          </p>
          <p className="text-[#6B7280] text-[12px]">All Time</p>
        </div>
        <div className=" rounded-full p-2 bg-blue-200 ">
          <MdPeopleOutline size={24} color="#2563EB" />{" "}
        </div>
      </div>
      <p className="text-[#22C55E] text-[12px] font-medium mt-2">
        {" "}
        {/* <span className="pr-4">23% inc</span> since last month */}
        100% inc
      </p>
    </div>
  );
}
