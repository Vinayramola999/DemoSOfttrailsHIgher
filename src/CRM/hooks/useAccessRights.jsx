// src/CRM/hooks/useAccessRights.js
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import {
  fetchAccessRights,
  resetAccessRights,
} from "../store/accessRightsSlice";

export const useAccessRights = (userId) => {
  const dispatch = useDispatch();
  const { data: rights, loading, error } = useSelector(
    (state) => state.accessRights
  );

  // Load rights automatically when userId is available
  useEffect(() => {
    if (userId) {
      dispatch(fetchAccessRights(userId));
    }
  }, [dispatch, userId]);

  const reloadAccessRights = useCallback(() => {
    if (userId) {
      dispatch(fetchAccessRights(userId));
    }
  }, [dispatch, userId]);

  const clearAccessRights = () => {
    dispatch(resetAccessRights());
  };

  // 🔥 helper to check rights (array of objects)
  const hasAccess = (permission) => {
    if (!rights) return false;
    return rights.some((r) => r.api_name === permission);
  };

  return {
    rights,
    loading,
    error,
    reloadAccessRights,
    clearAccessRights,
    hasAccess,
  };
};
