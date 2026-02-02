// src/CRM/store/accessRightsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_BASE_URL from "../config/api";
const token = () => sessionStorage.getItem("token");

// Fetch access rights for current user
export const fetchAccessRights = createAsyncThunk(
  "accessRights/fetchAccessRights",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/access/${userId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch access rights"
      );
    }
  }
);

const accessRightsSlice = createSlice({
  name: "accessRights",
  initialState: {
    data: {},
    loading: false,
    error: null,
  },
  reducers: {
    resetAccessRights: (state) => {
      state.data = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccessRights.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccessRights.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || {};
      })
      .addCase(fetchAccessRights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAccessRights } = accessRightsSlice.actions;
export default accessRightsSlice.reducer;
