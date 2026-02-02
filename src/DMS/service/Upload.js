import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export async function fetchMap(token) {
  const response = await fetch(`${API_BASE}/mapping`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch map");
  return response.json();
}

export async function fetchServices(token) {
  const res = await axios.get(`${API_BASE}/dmsapi/upload`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchDocTypes(token, id) {
  const res = await axios.get(`${API_BASE}/dmsapi/upload?service_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchAllowed(token, sid, did) {
  const res = await axios.get(
    `${API_BASE}/dmsapi/upload?service_id=${sid}&doctype_id=${did}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

export async function fetchFormats(token, sid, did, aid) {
  const res = await axios.get(
    `${API_BASE}/dmsapi/upload?service_id=${sid}&doctype_id=${did}&allow_doc_id=${aid}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data.flatMap((item) => item.format || []);
}

export async function fetchDocuments(token) {
  const res = await axios.get(`${API_BASE}/dmsapi/documents`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function uploadDocuments(token, formData) {
  const res = await axios.post(
    `${API_BASE}/dmsapi/upload-documents`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}

export async function deleteDocument(token, id) {
  await axios.delete(`${API_BASE}/dmsapi/documents/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}
