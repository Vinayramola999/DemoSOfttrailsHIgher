// export default useCustomerData;
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";

const useCustomerData = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactDetails, setContactDetails] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const getToken = useCallback(() => sessionStorage.getItem("token"), []);

  const buildCustomerPayload = useCallback((customer, isUpdate = false) => {
    const clean = (val) => (val && val.trim() !== "" ? val.trim() : null);

    const name = clean(customer.customer_name);
    const phone = clean(customer.phone_number);
    const email = clean(customer.email_id);

    if (!name) return { error: "Customer Name is required." };
    if (!phone && !email)
      return { error: "Either mobile Number or Email is required." };

    const payload = {
      customer_name: name,
      phone_number: phone,
      email_id: email,
      address: clean(customer.address),
      country: clean(customer.country),
      state: clean(customer.state),
      city: clean(customer.city),
      pincode: clean(customer.pincode),
      tan_number: clean(customer.tan_number),
      gst_number: clean(customer.gst_number),
      industry: clean(customer.industry),
      pan_no: clean(customer.pan_no),

    };

    if (!isUpdate) {
      payload.verified = false;
      payload.status = "active";
    } else if (customer.status) {
      payload.status = customer.status;
    }

    return payload;
  }, []);

  // const fetchCustomers = useCallback(
  //   async (stageFilter = "Approved") => {
  //     const token = getToken();
  //     if (!token) {
  //       console.error("Token is missing");
  //       navigate("/");
  //       return { success: false, error: "Token missing" };
  //     }

  //     setLoading(true);
  //     try {
  //       let url = `${API_BASE_URL}/customers`;
  //       if (stageFilter) {
  //         url += Array.isArray(stageFilter)
  //           ? `?stageFilter=${stageFilter.join(",")}`
  //           : `?stageFilter=${stageFilter}`;
  //       }

  //       const response = await axios.get(url, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       const sortedData = response.data.sort(
  //         (a, b) => a.customer_id - b.customer_id
  //       );
  //       setCustomers(sortedData);
  //       return { success: true, data: sortedData };
  //     } catch (error) {
  //       console.error("Failed to fetch customers:", error);
  //       return { success: false, error: error.message };
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [API_BASE_URL, getToken, navigate]
  // );

  //   const fetchCustomers = useCallback(
  //     async (stageFilter = "Approved") => {
  //       const token = getToken();
  //       if (!token) {
  //         console.error("Token is missing");
  //         navigate("/");
  //         return { success: false, error: "Token missing" };
  //       }

  //       setLoading(true);

  //       try {
  //         let url = `${API_BASE_URL}/customers`;

  //         if (stageFilter) {
  //           url += Array.isArray(stageFilter)
  //             ? `?stageFilter=${stageFilter.join(",")}`
  //             : `?stageFilter=${stageFilter}`;
  //         }

  //         const response = await axios.get(url, {
  //           headers: { Authorization: `Bearer ${token}` },
  //         });

  //         // ✅ Extract customers from correct API structure
  //         const customersArray = response.data?.data?.customers || [];

  //         // ✅ Sort by customer_id
  //         const sortedData = customersArray.sort(
  //           (a, b) => a.customer_id - b.customer_id
  //         );

  //         setCustomers(sortedData);
  // return { success: true, data: sortedData };


  //         return { success: true, data: sortedData };

  //       } catch (error) {
  //         console.error("Failed to fetch customers:", error);
  //         return { success: false, error: error.message };

  //       } finally {
  //         setLoading(false);
  //       }
  //     },
  //     [API_BASE_URL, getToken, navigate]
  //   );

  const fetchCustomers = useCallback(
    async (stageFilter = null) => {
      const token = getToken();
      if (!token) {
        console.error("❌ Token is missing");
        navigate("/");
        return { success: false, error: "Token missing" };
      }

      setLoading(true);
      try {
        console.log("🔍 Fetching all customers (all pages)...");
        console.log("🎯 Will filter client-side for stage:", stageFilter || "none");

        // ✅ Fetch all pages of customers
        let allCustomers = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
          const url = `${API_BASE_URL}/customers?page=${currentPage}`;
          console.log(`� Fetching page ${currentPage}/${totalPages}...`);

          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Extract customers and pagination info
          const pageData = response.data?.data || response.data || {};
          const customersArray = pageData.customers || response.data?.customers || response.data || [];

          allCustomers = [...allCustomers, ...customersArray];

          // Update pagination info
          totalPages = pageData.totalPages || 1;
          currentPage++;

          console.log(`✅ Page fetched: ${customersArray.length} customers (Total so far: ${allCustomers.length})`);

        } while (currentPage <= totalPages);

        console.log(`📊 Total customers fetched from all pages: ${allCustomers.length}`);

        if (allCustomers.length > 0) {
          console.log("📋 Sample stages from API:", allCustomers.slice(0, 5).map(c => ({ id: c.customer_id, stage: c.stage })));
        }

        // Now use allCustomers instead of customersArray
        const customersArray = allCustomers;

        // ✅ Apply client-side filter if stageFilter is provided
        let filteredCustomers = customersArray;
        if (stageFilter) {
          const allowed = Array.isArray(stageFilter)
            ? stageFilter.map((s) => String(s).toLowerCase().trim())
            : [String(stageFilter).toLowerCase().trim()];

          console.log("🎯 Filtering for stages (normalized):", allowed);

          filteredCustomers = customersArray.filter((c) => {
            const customerStage = (c.stage || "").toString().toLowerCase().trim();
            return allowed.includes(customerStage);
          });

          console.log(`✅ After client-side filter: ${filteredCustomers.length} customers match stage "${stageFilter}"`);

          // Warn if filter was applied but no results
          if (filteredCustomers.length === 0) {
            console.warn(`⚠️ No customers found with stage "${stageFilter}". Total customers: ${customersArray.length}`);
            const stageBreakdown = customersArray.reduce((acc, c) => {
              const stage = c.stage || "undefined";
              acc[stage] = (acc[stage] || 0) + 1;
              return acc;
            }, {});
            console.log("� Stage breakdown:", stageBreakdown);
          }
        }

        const sortedData = Array.isArray(filteredCustomers)
          ? filteredCustomers.sort((a, b) => (a.customer_id || 0) - (b.customer_id || 0))
          : [];

        console.log(`📤 Setting ${sortedData.length} customers in state`);

        // Log the customer IDs being set for debugging
        if (sortedData.length > 0) {
          console.log("📋 Customer IDs being set:", sortedData.map(c => c.customer_id));
        }

        setCustomers(sortedData);
        return { success: true, data: sortedData };
      } catch (error) {
        console.error("❌ Failed to fetch customers:", error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL, getToken, navigate]
  );


  const createCustomer = useCallback(
    async (customerData, stageFilter = null) => {
      const payload = buildCustomerPayload(customerData, false);
      if (payload.error) return { success: false, error: payload.error };

      const token = getToken();
      if (!token) return { success: false, error: "Token does not exist." };
      console.log("🚀 Creating customer with payload in use customer :", payload);
      try {
        const response = await fetch(`${API_BASE_URL}/customers`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Customer created successfully:", result);
          console.log("🔄 Refreshing customer list with filter:", stageFilter);

          // ✅ Pass the stageFilter to maintain current view
          await fetchCustomers(stageFilter);

          console.log("✅ Customer list refreshed");
          return { success: true, data: result };
        } else {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.message || "Failed to save the customer.",
          };
        }
      } catch (error) {
        console.error("An error occurred while saving the customer:", error);
        return {
          success: false,
          error: "An unexpected error occurred. Please try again.",
        };
      }
    },
    [API_BASE_URL, buildCustomerPayload, getToken, fetchCustomers]
  );

  const updateCustomerData = useCallback(
    async (customerId, customerData) => {
      const payload = buildCustomerPayload(customerData, true);
      if (payload.error) return { success: false, error: payload.error };

      const token = getToken();
      if (!token) return { success: false, error: "Token does not exist." };

      // ✅ Automatically set stage to Pending when updated
      const updatedPayload = { ...payload, stage: "Pending" };

      try {
        const response = await fetch(
          `${API_BASE_URL}/customers/${customerId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPayload),
          }
        );

        if (response.status === 200) {
          await fetchCustomers("Approved"); // refresh approved table
          return { success: true };
        } else {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.message || "Error updating customer.",
          };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [API_BASE_URL, buildCustomerPayload, getToken, fetchCustomers]
  );


  const deleteCustomer = useCallback(
    async (customerId, stageFilter = null) => {
      if (!customerId)
        return { success: false, error: "Customer ID is required" };

      const token = getToken();
      if (!token) return { success: false, error: "Token does not exist." };

      try {
        const response = await axios.delete(
          `${API_BASE_URL}/customers/${customerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          // ✅ Pass the stageFilter to maintain current view
          await fetchCustomers(stageFilter);
          return { success: true };
        } else {
          return {
            success: false,
            error: "Failed to delete customer: " + response.statusText,
          };
        }
      } catch (error) {
        const errorMsg = error.response
          ? error.response.data.error
          : error.message;
        return { success: false, error: errorMsg };
      }
    },
    [API_BASE_URL, getToken, fetchCustomers]
  );

  const flagCustomer = useCallback(
    async (customerId, reason) => {
      if (!reason.trim()) return { success: false, error: "Reason is required" };

      const token = getToken();
      if (!token) return { success: false, error: "Token does not exist." };

      try {
        // POST /customers/:id/flag - Flags (archives) a customer and stores a snapshot
        await axios.post(
          `${API_BASE_URL}/customers/${customerId}/flag`,
          { reason },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        // Refresh only approval-related stages (faster than full fetch)
        await fetchCustomers(["Pending", "Resubmitted"]);
        return { success: true };
      } catch (error) {
        console.error("Error flagging customer:", error);
        return { success: false, error: error.message };
      }
    },
    [API_BASE_URL, getToken, fetchCustomers]
  );

  const updateCustomerStage = useCallback(
    async (customerId, stage, reason = null) => {
      const token = getToken();
      if (!token) return { success: false, error: "Token does not exist." };

      const updateData = { stage, ...(reason && { reason }) };

      try {
        const response = await axios.put(
          `${API_BASE_URL}/customers/${customerId}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setCustomers((prev) =>
          prev.map((c) =>
            c.customer_id === customerId ? { ...c, stage, reason } : c
          )
        );
        return { success: true, data: response.data };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || "Failed to update stage",
        };
      }
    },
    [API_BASE_URL, getToken]
  );

  // ✅ Updated 3 functions to refresh only approval-related stages (faster than full fetch)
  const approveCustomer = useCallback(
    async (customerId) => {
      try {
        await updateCustomerStage(customerId, "Approved");
        // Refresh only Pending + Resubmitted for the approval tab (faster than full fetch)
        await fetchCustomers(["Pending", "Resubmitted"]);
      } catch (err) {
        throw err;
      }
    },
    [updateCustomerStage, fetchCustomers]
  );

  const rejectCustomer = useCallback(
    async (customerId, reason) => {
      const finalReason = reason?.trim() || "Rejected";
      try {
        await flagCustomer(customerId, finalReason);
        // Refresh only Pending + Resubmitted for the approval tab (faster than full fetch)
        await fetchCustomers(["Pending", "Resubmitted"]);
      } catch (err) {
        throw err;
      }
    },
    [flagCustomer, fetchCustomers]
  );

  const resubmitCustomer = useCallback(
    async (customerId, reason) => {
      try {
        await updateCustomerStage(customerId, "Resubmitted", reason);
        // Refresh only Pending + Resubmitted for the approval tab (faster than full fetch)
        await fetchCustomers(["Pending", "Resubmitted"]);
      } catch (err) {
        throw err;
      }
    },
    [updateCustomerStage, fetchCustomers]
  );

  const verifyCustomer = useCallback(
    async (customerId, field, value) => {
      const token = getToken();
      if (!token) return { success: false, error: "Token does not exist." };

      try {
        await fetch(`${API_BASE_URL}/customers/${customerId}/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [field]: value }),
        });

        setCustomers((prev) =>
          prev.map((c) =>
            c.customer_id === customerId ? { ...c, [field]: value } : c
          )
        );

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [API_BASE_URL, getToken]
  );

  const fetchContactDetails = useCallback(
    async (customerId = null) => {
      const token = getToken();
      if (!token) {
        console.error("Token is missing");
        navigate("/");
        return { success: false, error: "Token missing" };
      }

      setLoadingContacts(true);
      try {
        const url = customerId
          ? `${API_BASE_URL}/contacts?customer_id=${customerId}`
          : `${API_BASE_URL}/contacts`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setContactDetails(Array.isArray(data) ? data : []);
          return { success: true, data };
        } else {
          return { success: false, error: "Failed to fetch contacts" };
        }
      } catch (error) {
        return { success: false, error: error.message };
      } finally {
        setLoadingContacts(false);
      }
    },
    [API_BASE_URL, getToken, navigate]
  );

  const createContact = useCallback(
    async (contactData, customerId) => {
      if (!contactData.contact_person)
        return { success: false, error: "Contact Name is required." };
      if (!contactData.phone_num && !contactData.email_id)
        return {
          success: false,
          error: "Either mobile Number or Email is required.",
        };

      const token = getToken();
      if (!token) return { success: false, error: "Token does not exist." };

      const payload = {
        customer_id: customerId,
        contact_person: contactData.contact_person,
        email_id: contactData.email_id?.trim() || null,
        phone_num: contactData.phone_num?.trim() || null,
        address: contactData.address,
        country: contactData.country,
        state: contactData.state,
        city: contactData.city,
        pincode: contactData.pincode,
        department: contactData.department,
        designation: contactData.designation,
        date_of_start: contactData.date_of_start,
        date_of_end: contactData.date_of_end,
        status: contactData.status,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/contacts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const savedContact = await response.json();
          setContactDetails((prev) => [...prev, savedContact]);
          return { success: true, data: savedContact };
        } else {
          const errorData = await response.json();
          return { success: false, error: errorData.message };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [API_BASE_URL, getToken]
  );

  const updateContactData = useCallback(
    async (contactId, contactData) => {
      const token = getToken();
      if (!token) return { success: false, error: "Token does not exist." };

      try {
        const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(contactData),
        });

        if (response.ok) return { success: true };
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [API_BASE_URL, getToken]
  );

  const deleteContact = useCallback(
    async (contactId) => {
      const token = getToken();
      if (!token) return { success: false, error: "Token does not exist." };

      try {
        const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok)
          return { success: false, error: "Failed to delete contact" };

        setContactDetails((prev) =>
          prev.filter((c) => c.contact_id !== contactId)
        );
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [API_BASE_URL, getToken]
  );

  return {
    customers,
    loading,
    contactDetails,
    loadingContacts,
    fetchCustomers,
    createCustomer,
    updateCustomerData,
    deleteCustomer,
    flagCustomer,
    verifyCustomer,
    updateCustomerStage,
    approveCustomer,
    rejectCustomer,
    resubmitCustomer,
    fetchContactDetails,
    createContact,
    updateContactData,
    deleteContact,
    buildCustomerPayload,
  };
};

export default useCustomerData;
