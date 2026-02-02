import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyToken = (redirectOnSuccess, redirectOnFail = "/") => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate(redirectOnFail);
      return;
    }

    axios
      .post("https://devdemo.softtrails.net/users/verify-token", {
        token,
      })
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
