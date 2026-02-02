import { Routes, Route, Navigate } from "react-router-dom";
import DmsSetup from "./Setup/DMSSetup";
import DmsUpload from "./Upload/DMSUpload";
import DmsApproval from "./Approval/DMSApproval";
import UserDashboard from "./Dashboard/UserDashboard"; // Import the document

const DMSRouter = () => (
  <Routes>
    <Route path="setup" element={<DmsSetup />} />
    <Route path="upload" element={<DmsUpload />} />
    <Route path="approval" element={<DmsApproval />} />
    <Route path="user-dashboard" element={<UserDashboard />} /> {/* Add the route */}
    <Route path="" element={<Navigate to="setup" replace />} />

  </Routes>
);

export default DMSRouter;
