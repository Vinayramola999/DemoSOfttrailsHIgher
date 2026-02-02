import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Card, Typography, TextField, InputAdornment, } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, LabelList, ResponsiveContainer, } from "recharts";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router-dom";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import EmployeeList from "./EmployeeList";
import {MAIN_API_BASE } from "../../config/apiBase";
const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63"];

export default function DMS() {
  const [employeeData, setEmployeeData] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departmentCounts, setDepartmentCounts] = useState([]);
  const [locationCounts, setLocationCounts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [activeDeptIndex, setActiveDeptIndex] = useState(null);
  const [activeLocationIndex, setActiveLocationIndex] = useState(null);
  const [hasUploadDocumentAccess, setHasUploadDocumentAccess] = useState(false);
  const [totalCounts, setTotalCounts] = useState({
    totalEmployees: 0,
    inactiveEmployees: 0,
    totalDepartments: 0,
    totalLocations: 0,
    maleEmployees: 0,
    femaleEmployees: 0,
  });

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const usersRes = await axios.get(`${MAIN_API_BASE}/users/flagged-catgeory-users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const deptRes = await axios.get(`${MAIN_API_BASE}/departments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const users = usersRes.data.users || [];
        const depts = deptRes.data || [];

        setEmployeeData(users);
        setFilteredEmployees(users);
        setDepartments(depts);

        const maleEmployees = users.filter(u => u.gender === "Male").length;
        const inactiveEmployees = users.filter(u => u.user_status === "inactive").length;

        const deptCounts = depts.map(d => {
          const usersInDept = users.filter(u => u.dept_name === d.dept_name);
          const subMap = usersInDept.reduce((acc, u) => {
            const sub = u.sub_dept_name || "N/A";
            acc[sub] = (acc[sub] || 0) + 1;
            return acc;
          }, {});
          return { name: d.dept_name, value: usersInDept.length, details: subMap };
        });

        const locCounts = users.reduce((acc, u) => {
          const loc = u.locality || "Unknown";
          const sub = u.sub_dept_name || "N/A";
          const found = acc.find(i => i.name === loc);
          if (found) {
            found.value += 1;
            found.details[sub] = (found.details[sub] || 0) + 1;
          } else {
            acc.push({ name: loc, value: 1, details: { [sub]: 1 } });
          }
          return acc;
        }, []);

        setDepartmentCounts(deptCounts);
        setLocationCounts(locCounts);

        setTotalCounts({
          totalEmployees: users.length,
          inactiveEmployees,
          totalDepartments: depts.length,
          totalLocations: [...new Set(users.map(u => u.locality))].length,
          maleEmployees,
          femaleEmployees: users.length - maleEmployees,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  /* ---------------- ACCESS CHECK ---------------- */
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");
        if (!userId || !token) return;

        const res = await axios.get(
          `${MAIN_API_BASE}/access/access/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setHasUploadDocumentAccess(
          res.data.some(a => a.api_name === "UploadDocument")
        );
      } catch {
        setHasUploadDocumentAccess(false);
      }
    };
    checkAccess();
  }, []);

  /* ---------------- FILTER ---------------- */
  const filterEmployees = (search, dept) => {
    let filtered = [...employeeData];
    if (search) {
      const t = search.toLowerCase();
      filtered = filtered.filter(e =>
        `${e.first_name} ${e.last_name} ${e.email}`.toLowerCase().includes(t)
      );
    }
    if (dept) filtered = filtered.filter(e => e.dept_name === dept);
    setFilteredEmployees(filtered);
  };

  const pieData = [
    { name: "Male", value: totalCounts.maleEmployees },
    { name: "Female", value: totalCounts.femaleEmployees },
  ];

  const cardStyle = "p-4 bg-white rounded-xl border border-gray-300 shadow-lg w-full min-h-[180px] flex flex-col";

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{}}>

        {/* ---------- CHARTS ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Gender */}
          <Card className={cardStyle}>
            <Typography variant="h6">Employees: {totalCounts.totalEmployees}</Typography>
            <div className="flex justify-center flex-1">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" outerRadius={65}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Departments */}
          <Card className={cardStyle}>
            <Typography variant="h6">Departments</Typography>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={departmentCounts} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} />
                <Bar dataKey="value" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Locations */}
          <Card className={cardStyle}>
            <Typography variant="h6">Locations</Typography>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={locationCounts} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} />
                <Bar dataKey="value" fill="#FF9800" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ---------- SEARCH ---------- */}
        <div className="flex flex-wrap gap-3 items-center mt-3">
          <TextField
            size="small"
            placeholder="Search employee"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              filterEmployees(e.target.value, selectedDepartment);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
            }}
          />

          <select
            className="border rounded-full px-3 py-2 text-sm"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              filterEmployees(searchText, e.target.value);
            }}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.dept_id}>{d.dept_name}</option>
            ))}
          </select>

          {hasUploadDocumentAccess && (
            <Link
              to="/UploadEmpDocsTab"
              className="ml-auto flex items-center bg-blue-700 text-white px-3 py-2 rounded-md"
            >
              <CloudUploadOutlinedIcon fontSize="small" />
              <span className="ml-2">Upload Documents</span>
            </Link>
          )}
        </div>

        {/* ---------- TABLE ---------- */}
        <div className="mt-2 bg-white rounded-xl border shadow-lg">
          <div className="max-h-[420px] overflow-y-auto">
            <EmployeeList employee={filteredEmployees} />
          </div>
        </div>
      </Box>
    </Box>
  );
}