import React from "react";
import DepartmentGraph from './DepartmentGraph';
import DesignationChart from './DesignationCharts';
import LocationBarGraph from './LocationBarGraph';
import DomainChart from "./DomainChart";
import UserCategoryChart from "./UserCategoryChart";

const Dashboard = (setActiveTab) => {
    return (
        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 pb-20">
            {/* 
                Grid Layout Strategy:
                - Mobile: 1 column
                - Tablet (md): 2 columns. Key trick: 3rd item spans 2 cols to fill Row 2.
                - Desktop (lg): 6 columns. Row 1 has 3 items (2 cols each). Row 2 has 2 items (3 cols each).
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                
                {/* Row 1: Donut Charts (Compact) */}
                <div className="col-span-1 lg:col-span-2">
                    <DepartmentGraph setActiveTab={setActiveTab} />
                </div>
                <div className="col-span-1 lg:col-span-2">
                    <UserCategoryChart />
                </div>
                {/* On tablet, this one spans full width to create a nice 1-2-1 flow or similar, maintaining balance */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <DomainChart />
                </div>

                {/* Row 2: Bar Charts (Need more width) */}
                <div className="col-span-1 lg:col-span-3">
                    <DesignationChart />
                </div>
                <div className="col-span-1 lg:col-span-3">
                    <LocationBarGraph />
                </div>

            </div>
        </div>
    );
};
export default Dashboard;