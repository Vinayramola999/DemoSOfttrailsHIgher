import React, { useEffect, useState } from "react";
import axios from "axios";
import { TextField, Button, CircularProgress, Container, Grid } from "@mui/material";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const DynamicForm = ({ categoryId }) => {
  const [dynamicData, setDynamicData] = useState({});
  const [locationData, setLocationData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchTableData(categoryId);
  }, [categoryId]);

 const fetchTableData = async (categoryId) => {
  if (!categoryId) {
    console.error("Category ID is missing! Check if selectedCategory is set correctly.");
    return;
  }

  console.log("Fetching table data for category ID:", categoryId);
  setIsLoading(true);

  try {
    // 🔑 Get token from sessionStorage
    const token = sessionStorage.getItem("token");

    const response = await axios.get(
     `${JAVA_BASE}api/asset-allocation/category/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Attach token
        },
      }
    );

    const { dynamic_data, location_details } = response.data;

    setDynamicData(dynamic_data || {});
    setLocationData(location_details || {});
    setFormErrors({});
  } catch (error) {
    console.error("Error fetching table data:", error.message);
    setFormErrors({ general: "Error fetching table data. Please try again." });
  } finally {
    setIsLoading(false);
  }
};


  const handleChange = (e, section) => {
    const { name, value } = e.target;
    if (section === "dynamic") {
      setDynamicData((prev) => ({ ...prev, [name]: value }));
    } else {
      setLocationData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Form Data:", { dynamicData, locationData });
  };

  return (
    <Container>
      <h2>Dynamic Form</h2>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Dynamic Data Fields */}
            {Object.entries(dynamicData).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  label={key.replace(/_/g, " ")}
                  name={key}
                  value={value || ""}
                  onChange={(e) => handleChange(e, "dynamic")}
                  fullWidth
                />
              </Grid>
            ))}

            {/* Location Details Fields */}
            {Object.entries(locationData).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  label={key.replace(/_/g, " ")}
                  name={key}
                  value={value || ""}
                  onChange={(e) => handleChange(e, "location")}
                  fullWidth
                />
              </Grid>
            ))}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </Container>
  );
};

export default DynamicForm;
