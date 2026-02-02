import React, { useEffect, useState } from "react";
import { Container, Card, CardContent, Typography, CircularProgress, Grid, } from "@mui/material";
import { FaTasks } from "react-icons/fa";
import axios from "axios";
import { MAIN_API_BASE } from "../../config/apiBase";

const JobDetailsPortal = () => {
  const [jobDetails, setJobDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [managerName, setManagerName] = useState("Not available");

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");
    if (!userId || !token) {
      console.error("❌ Missing userId or token");
      setLoading(false);
      return;
    }
    axios.get(`${MAIN_API_BASE}/users/id_user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const jobData = response.data.user;
        setJobDetails(jobData);
        setManagerName(jobData?.manager_name || "Not available");
      })
      .catch((error) => {
        console.error("❌ Error fetching job details:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    );
  }

  // Capitalize first letter for status
  const formatStatus = (status) => {
    if (!status) return "Not available";
    const formatted = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const color =
      formatted.toLowerCase() === "active"
        ? "text-green-600"
        : formatted.toLowerCase() === "inactive"
        ? "text-red-600"
        : "text-gray-700";
    return <span className={`font-semibold ${color}`}>{formatted}</span>;
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        <div className="flex items-center gap-2 text-gray-800">
          <FaTasks />
          <span>Job Details</span>
        </div>
      </Typography>

      <Card className="shadow-md rounded-xl">
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Employee ID:</Typography>
              <Typography>{jobDetails.emp_id || "Not available"}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Employee Name:</Typography>
              <Typography>
                {jobDetails.first_name || ""} {jobDetails.last_name || ""}
              </Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Job Title:</Typography>
              <Typography>{jobDetails.designation || "Not available"}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Department:</Typography>
              <Typography>{jobDetails.dept_name || "Not available"}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Sub Department:</Typography>
              <Typography>{jobDetails.sub_dept_name || "Not available"}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Manager:</Typography>
              <Typography>{managerName}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Location:</Typography>
              <Typography>{jobDetails.locality || "Not available"}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Employment Status:</Typography>
              <Typography>{formatStatus(jobDetails.user_status)}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Profile Created At:</Typography>
              <Typography>
                {jobDetails.user_created_at
                  ? new Date(jobDetails.user_created_at).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "Not available"}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default JobDetailsPortal;