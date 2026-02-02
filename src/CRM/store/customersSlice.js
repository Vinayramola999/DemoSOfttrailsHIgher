// src/CRM/store/customersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_BASE_URL from "../config/api";

// ✅ Helper to get token from session storage
const token = () => sessionStorage.getItem("token");

/* ---------------- Thunks ---------------- */

// Fetch all customers
export const fetchCustomers = createAsyncThunk("customers/fetchAll", async () => {
  const res = await axios.get(`${API_BASE_URL}/customers`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  return res.data;
});

// Add new customer
export const addCustomer = createAsyncThunk("customers/add", async (payload) => {
  const res = await axios.post(`${API_BASE_URL}/customers`, payload, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  return res.data;
});

// Edit existing customer
export const editCustomer = createAsyncThunk(
  "customers/edit",
  async ({ id, payload }) => {
    const res = await axios.put(`${API_BASE_URL}/customers/${id}`, payload, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    return res.data;
  }
);

// Delete customer
export const deleteCustomer = createAsyncThunk("customers/delete", async (id) => {
  await axios.delete(`${API_BASE_URL}/customers/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  return id;
});

//Flag customer
export const flagCustomer = createAsyncThunk(
  "customers/flagCustomer",
  async ({ customerId, reason }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/customers/flag/${customerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stage: "flagged", reason }),
        }
      );
      if (!res.ok) throw new Error("Failed to flag customer");
      return { customerId, reason };
    } catch (err) {
      return rejectWithValue(err.message || "Flag failed");
    }
  }
);

//verify status
export const updateCustomerVerifyStatus = createAsyncThunk(
  "customers/updateCustomerVerifyStatus",
  async ({ customerId, field, value }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/customers/${customerId}/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [field]: value }),
        }
      );
      if (!res.ok) throw new Error("Failed to update verification");
      return { customerId, field, value };
    } catch (err) {
      return rejectWithValue(err.message || "Update verification failed");
    }
  }
);

/* ---------------- Slice ---------------- */

const customersSlice = createSlice({
  name: "customers",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {}, // no local reducers yet
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      // Edit
      .addCase(editCustomer.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (c) => c.customer_id === action.payload.customer_id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.data = state.data.filter((c) => c.customer_id !== action.payload);
      });
  },
});

export default customersSlice.reducer;
