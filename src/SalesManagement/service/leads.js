import axios from "axios";

const baseUrl = process.env.REACT_APP_URL_sales || '';

const fetchVerifiedLeads = async () => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(
    `${baseUrl}/salesmanagement/leads/get-verifyedlead`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.leads;
};

export default fetchVerifiedLeads;
