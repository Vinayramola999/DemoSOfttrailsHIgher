// MainLayout.js
import MainLayout from "./MainLayout"; // import your layout
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// Import Components and Pages
import Login from "./Pages/Login";
import Cards from "./Cards/Cards";
import HRMS from "./Cards/HRMS";
import AssetManagement from "./Cards/AssetManagement";
import ProductAssembly from "./Cards/ProductAssembly";
import ProfilePart from "./Cards/ProfilePart";
import Verify from "./Pages/Verify";
import Password from "./Pages/Password";
import NewPassword from "./Components/NewPassword";
import ChangePassword from "./Components/ChangePassword";
import LogsPage from "./Logs/LogsPage";
//Global Module
import Organization from "./OrganizationSetup/Organization";
import Users from "./UserManagemnt/Users";
import AccessPrivilege from "./AccessPrivilege/AccessPrivilege";
// HRMS
import Leave from "./HRMS/LeaveManagement/Leave";
import HRCorner from "./HRMS/HRDatabase/HRCorner";
import AMSTab from "./HRMS/AttendanceManagement/AMSTab";
import PMSTab from "./HRMS/PMS/PMSTab";
// Asset Management
import Reports from "./Asset/Reports/DashTabs";
import Tabs from "./Asset/Asset/Tabs";
import Approvaltabs from "./Asset/ApprovalAuthority/Approvaltabs";
import Category from "./Asset/Category";
import WorkflowPage from "./Asset/Workflow";
import Depreciation from "./Asset/Depreciation";
import ResubmittedApproval from "./Asset/ResubmittedApproval";
import OrganisationLevel from "./Asset/OrganisationLevel";
import ApprovalAuthority from "./Asset/ApprovalAuthority";
import AddRequirement from "./Asset/Category/AddRequriement";
import Project from "./Asset/Process Management/Project";
import ProjectApproval from "./Asset/Process Management/ProjectApproval";
import AllocationRequest from "./Asset/Process Management/AllocationRequest";
import AssetHistory from "./Asset/Asset History/AssetHistory";
import Processtab from "./Asset/Process Management/Processtab";
import ProjectEstimation from "./Asset/Process Management/ProductionEstimation";
import ProductionOutput from "./Asset/Process Management/ProductionOutput";
import ProductionRepository from "./Asset/Process Management/ProductionRepository";
//Employee Data
import EmployeeData from "./HRMS/employee data/EmployeeData";
import UploadEmpDocsTab from "./HRMS/employee data/UploadEmpDocsTab";
import EmployeeLayout from "./HRMS/employee data/EmployeeLayout";
import DocumentPage from "./HRMS/employee data/EmployeeDocuments";
//DMS
import DMSRouter from "./DMS/DMSRouter";
//CRM
import CRMTabs from "./CRM/CRMTabs";
import Customer from "./CRM/Customer/pages/Customer";
//UCS
import AllTabs from "./UCS/AllTabs";
import UCS3 from "./UCS/UCS3";
//Purchase module
import PurchaseModule from "./PurchaseModule/PurchaseModule";
import FinancialBudget from "./PurchaseModule/FinancialBudget";
import PurchaseApproval from "./PurchaseModule/Approvals";
import PurchaseWorkflow from "./PurchaseModule/PurchaseWorkflow";
import VendorManagement from "./PurchaseModule/VendorManagement";
import PurchaseProcess from "./PurchaseModule/PurchaseProcess";
import RepoAllTab from "./Asset/Asset/RepoAllTab";
import AllTab from "./Asset/ApprovalAuthority/AllTab";
import CategoryTab from "./Asset/Category/CatergoryTab";
import QuotationView from "./PurchaseModule/rfpTabs/QuotationView";

//Sales Management
import SetupWorkflow from "./Workflow/SetupWorkflow";
import SubmitApprovalTab from "./CRM/Customer/pages/SubmitApprovalTab";
import Lead from "./SalesManagement/Lead";
import QuotationPreview from "./SalesManagement/QuotationPreview";
import Salesprocess from "./SalesManagement/Salesprocess";
import HMSApp from "./HospitalManagement/HMSApp";

function App({ employeeId, userId }) {
  const appRouter = createBrowserRouter([
    //***********************With no HEader *************** */
    { path: "/", element: <Login /> },
    { path: "/password", element: <Password /> },
    { path: "/verify", element: <Verify /> },
    { path: "/new-password", element: <NewPassword /> },
    { path: "profile-part", element: <ProfilePart /> },
    { path: "change-password", element: <ChangePassword /> },
    { path: "/cards", element: <Cards /> },
    { path: "/hrms", element: <HRMS /> },
    { path: "/AssetManagement", element: <AssetManagement /> },
    { path: "/ProductAssembly", element: <ProductAssembly /> },
    //1...... Employee Data
    { path: "employeedata", element: <EmployeeData /> },
    { path: "/SubmitApprovalTab", element: <SubmitApprovalTab /> },

    //***********************  WITH HEADER  *********************/
    {
      path: "/",
      element: <MainLayout />,
      children: [
        //1...........Global Module...............
        { path: "organization", element: <Organization /> },
        { path: "users", element: <Users /> },
        { path: "accessprivilege", element: <AccessPrivilege /> },

        //2...............HRMS..............................
        { path: "leave", element: <Leave /> },
        { path: "/HRCorner", element: <HRCorner /> },
        { path: "/AMSTab", element: <AMSTab /> },
        { path: "/PMSTab", element: <PMSTab /> },

        //3.................Asset Management
        { path: "/Tabs", element: <Tabs /> },
        { path: "/Approvaltabs", element: <Approvaltabs /> },
        { path: "/categories", element: <Category /> },
        { path: "/workflow", element: <WorkflowPage /> },
        { path: "/approval", element: <ApprovalAuthority /> },
        { path: "/resubmittedapproval", element: <ResubmittedApproval /> },
        { path: "/organizationlevel", element: <OrganisationLevel /> },
        { path: "/depreciation", element: <Depreciation /> },
        { path: "/RepoAllTab", element: <RepoAllTab /> },
        { path: "/AllTab", element: <AllTab /> },
        { path: "/CategoryTab", element: <CategoryTab /> },
        { path: "/AddRequirement", element: <AddRequirement /> },
        { path: "/AssetHistory", element: <AssetHistory /> },
        { path: "/Processtab", element: <Processtab /> },
        { path: "/Reports", element: <Reports /> },

        //4................DMS............
        { path: "/dms/*", element: <DMSRouter /> },

        //6............Purchase Module & Financial Budget
        { path: "/PurchaseModule", element: <PurchaseModule /> },
        { path: "/PurchaseApproval", element: <PurchaseApproval /> },
        { path: "/PurchaseProcess", element: <PurchaseProcess /> },
        { path: "/PurchaseWorkflow", element: <PurchaseWorkflow /> },
        { path: "/VendorManagement", element: <VendorManagement /> },
        { path: "/FinancialBudget", element: <FinancialBudget /> },
        { path: "/quotation/:quotationId", element: <QuotationView /> },

        //7................LogsPage
        { path: "logspage", element: <LogsPage /> },
        //6...........Settings------ Profile
        { path: "employeelayout/:employeeId", element: <EmployeeLayout /> },
       //8.............Employee Data
        { path: "/UploadEmpDocsTab", element: <UploadEmpDocsTab /> },
        { path: "DocumentPage", element: <DocumentPage /> },
        //9..................Process Management
        { path: "/Project", element: <Project /> },
        { path: "/ProjectApproval", element: <ProjectApproval /> },
        { path: "/AllocationRequest", element: <AllocationRequest /> },
        { path: "/ProjectEstimation", element: <ProjectEstimation /> },
        { path: "/ProductionOutput", element: <ProductionOutput /> },
        { path: "/ProductionRepository", element: <ProductionRepository /> },
        //10...........CRM Module.........
        { path: "/CRMTabs", element: <CRMTabs /> },
        { path: "/Customer", element: <Customer /> },
        //11...........Sales Management.........
        { path: "/Lead", element: <Lead /> },
        { path: "/Salesprocess", element: <Salesprocess /> },
        { path: "/quotation-preview", element: <QuotationPreview /> },
        
        //13.............Workflow................
        { path: "/SetupWorkflow", element: <SetupWorkflow /> },

        ////..........UCS............
            { path: "/AllTabs", element: <AllTabs /> },
        { path: "/UCS3", element: <UCS3 /> },
        
        //..........Hospital Management..........
        { path: "/HospitalManagement/*", element: <HMSApp /> },

      ],
    },
  ]);
  return <RouterProvider router={appRouter} />;
}
export default App;
