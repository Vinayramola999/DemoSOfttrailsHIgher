import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {MAIN_API_BASE} from "../config/apiBase";
import axios from "axios";

const VerifyToken = (redirectOnSuccess, redirectOnFail = "/") => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate(redirectOnFail);
      return;
    }
    axios.post(`${MAIN_API_BASE}/users/verify-token`, { token })
      .then(() => {
        if (redirectOnSuccess) navigate(redirectOnSuccess);
      })
      .catch(() => {
        sessionStorage.clear();
        navigate(redirectOnFail);
      });
  }, [navigate, redirectOnSuccess, redirectOnFail]);
};

export default VerifyToken;
