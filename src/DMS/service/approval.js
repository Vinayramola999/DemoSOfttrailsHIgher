const API_BASE = process.env.REACT_APP_API_BASE_URL;

export async function fetchServiceData(token, ServiceId) {
  const resp = await fetch(
    `${API_BASE}/service/${encodeURIComponent(ServiceId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!resp.ok) throw new Error("Failed to fetch service data");
  return resp.json();
}

export async function fetchUserDocuments(token, serviceId, userId) {
  const resp = await fetch(
    `${API_BASE}/service/all/${encodeURIComponent(serviceId)}/${encodeURIComponent(userId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!resp.ok) throw new Error("Failed to fetch user documents");
  return resp.json();
}

export async function updateDocumentAction(token, docId, action, reason) {
  const resp = await fetch(
    `${API_BASE}/dmsapi/update-action/${encodeURIComponent(docId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, reason }),
    }
  );
  if (!resp.ok) throw new Error("Failed to update document action");
  return resp.json();
}
