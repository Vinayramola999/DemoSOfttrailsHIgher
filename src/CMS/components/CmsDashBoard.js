import React from "react";
import RevenueChart from "./RevenueChart";
import ProductSalesChart from "./ProductSalesChart";
import ActiveCustomerCard from "./ActiveCustomerCard";
import NewCustomersCard from "./NewCustomersCard";
import TotalCustomersCard from "./TotalCustomersCard";
import SoftTrailsCustomersCard from "./SoftTrailsCustomersCard";
import TotalSTCustomers from "./TotalSTCustomers";

export default function CmsDashBoard() {
  return (
    <div>
      <div className="mb-5 mr-5 overflow-y-scroll scrollbar-hide">
        <p className="text-[#00235A] text-[20px] font-semibold text-start">
          {/* Admin Management System Overview */}
        </p>

        {/* cardd  */}
        <div className="flex flex-wrap gap-4 ">
          {/* Total Customers */}
          <TotalCustomersCard />

          {/* new customers  */}
          <NewCustomersCard />

          {/*total softrail customers  */}
          <TotalSTCustomers />

          {/* softtrailcustomers  */}
          <SoftTrailsCustomersCard />

          {/* Active customers  */}
          <ActiveCustomerCard />
        </div>

        <div className="flex lg:flex-row flex-col gap-6 mt-6">
          {/* Revenue chart */}
          <div className="flex-1 bg-white rounded-lg shadow-md">
            <RevenueChart />
          </div>

          {/* Product chart */}
          <div className="flex-1 bg-white rounded-lg shadow-md ">
            <ProductSalesChart />
          </div>
        </div>
      </div>
    </div>
  );
}
