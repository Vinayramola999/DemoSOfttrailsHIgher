import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PatientRegistrationForm from './Pages/PatientRegistrationForm';
import PatientDetails from './Pages/PatientDetails';
import IpdManagement from './Pages/IpdManagement';
import ChargeList from './Pages/ChargeList';
import ManageList from './Pages/ManageList';
import PatientLifecycle from './Pages/patientLifecycle';
import GenerateBill from './Pages/GenerateBill';
import Billing from './Pages/Billing';
import Bill from './Pages/Bill';
import Advance from './Pages/Advance';
import Discount from './Pages/Discount';
import PatientHistory from './Pages/PatientHistory';
import FinalBill from './Pages/FinalBill';
import InventoryControl from './Pages/InventoryControl';
import MasterCreation from './Pages/MasterCreation';
import LogReports from './Pages/LogReports';

export default function HMSApp() {
  const [activePage, setActivePage] = useState('IPD management');
  const [activeSubPage, setActiveSubPage] = useState('Patient Registration');

  return (
    <div className="flex w-full h-screen overflow-hidden">
   
      <div className="flex-1 p-4 overflow-y-auto w-full">
      
        <Routes>
          <Route path="/" element={<Navigate to="patient-registration" replace />} />
          <Route path="patient-registration" element={<PatientRegistrationForm />} />
          <Route path="patient-details" element={<PatientDetails />} />
          <Route path="ipd-management" element={<IpdManagement />} />
          <Route path="ipd/admission" element={<IpdManagement />} />
          <Route path="ipd-lifecycle" element={<PatientLifecycle />} />
          <Route path="ipd/lifecycle" element={<PatientLifecycle />} />
          <Route path="manage-list" element={<ManageList />} />
          <Route path="charge-list" element={<ChargeList />} />
          <Route path="billing" element={<Billing />} />
          <Route path="generate-bill" element={<GenerateBill />} />
          <Route path="bill" element={<Bill />} />
          <Route path="advance" element={<Advance />} />
          <Route path="discount" element={<Discount />} />
          <Route path="patient-history" element={<PatientHistory />} />
          <Route path="final-bill" element={<FinalBill />} />
          <Route path="inventory" element={<InventoryControl />} />
          <Route path="master-creation" element={<MasterCreation />} />
          <Route path="log-reports" element={<LogReports />} />
          <Route path="inventory/logs" element={<LogReports />} />
        </Routes>
      </div>
    </div>
  );
}
