import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import DMS from "../assests/DMS.jpg";
import UCS from "../assests/UCS.jpg";
import HRMS from "../assests/HRMS.jpg";
import PM from "../assests/PurchaseModule.jpg";
import CRM from "../assests/CRM.jpg";
import Access from "../assests/Access.jpg";
import Logs from "../assests/Logs.jpg";
import FB from "../assests/FinancialBudget.jpg";
import UD from "../assests/User Directory.jpg";
import ASM from "../assests/Asset.jpg";
import WF from "../assests/UCS.jpg";
import { MAIN_API_BASE } from "../config/apiBase";

const allServices = [
  { key: "ORG", title: "Organization Setup", img: Access, path: "/Organization", },
  { key: "UMC", title: "Directory Service", img: UD, path: "/Users" },
  { key: "HRMS", title: "Human Resource Management System", img: HRMS, path: "/HRMS", },
  { key: "ASM", title: "Asset Management System", img: ASM, path: "/AssetManagement", },
  { key: "PAL", title: "Product Assembly Line", img: Logs, path: "/ProductAssembly" },
  { key: "doc_management", title: "Document Management System", img: DMS, path: "/dms", },
  { key: "CRM", title: "Customer Relationship Management", img: CRM, path: "/CRMTabs", },
  { key: "UCS", title: "Communication Service", img: UCS, path: "/AllTabs" },
  { key: "purchase_module", title: "Purchase Module", img: PM, path: "/PurchaseModule", },
  { key: "Budget", title: "Financial Budget", img: FB, path: "/FinancialBudget", },
  { key: "WF", title: "Workflow", img: WF, path: "/SetupWorkflow" },
  { key: "update_access", title: "Access Privilege", img: Access, path: "/AccessPrivilege", },
  { key: "LogsAccess", title: "Logs", img: Logs, path: "/LogsPage" },
  { key: "CMS", title: "CMS", img: Access, path: "/setup" },
];

const CardsImagePart = () => {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const userId = sessionStorage.getItem("userId");
        const cardTitles = allServices.map((service) => service.key);
        const res = await axios.post(`${MAIN_API_BASE}/access/verify-access`,
          {
            user_id: parseInt(userId),
            pages: cardTitles,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const allowedKeys = Object.keys(res.data).filter(
          (key) => res.data[key]
        );
        const filtered = allServices.filter((service) =>
          allowedKeys.includes(service.key)
        );
        setServices(filtered);
      } catch (error) {
        console.error("Error fetching access:", error);
      }
    };
    fetchAccess();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="relative group cursor-pointer bg-white rounded-xl shadow-md overflow-hidden min-w-0 w-full aspect-[4/3]"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate(service.path)}
          >
            <img
              src={service.img}
              alt={service.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-sm p-3 text-center">
              {service.title}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default CardsImagePart;
