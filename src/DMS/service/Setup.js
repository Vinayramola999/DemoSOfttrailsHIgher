const API_BASE = process.env.REACT_APP_API_BASE_URL;

export async function fetchServices(token) {
  const response = await fetch(`${API_BASE}/service`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch services");
  return response.json();
}

export async function addService({ serviceName, description }, token) {
  const response = await fetch(`${API_BASE}/service`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: serviceName, description }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to add service");
  return data;
}

export async function deleteService(id, token) {
  const response = await fetch(`${API_BASE}/service/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete service");
  return response;
}

export async function fetchDoctypes(token) {
  const response = await fetch(`${API_BASE}/doctype`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch document types");
  return response.json();
}

export async function addDoctype({ documentName, description }, token) {
  const response = await fetch(`${API_BASE}/doctype`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ doctype: documentName, description }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to add document type");
  return data;
}

export async function deleteDoctype(id, token) {
  const response = await fetch(`${API_BASE}/doctype/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to delete document type");
  return response;
}

export async function fetchAllowedDocs(token) {
  const response = await fetch(`${API_BASE}/allow_doc`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch allowed documents");
  return response.json();
}

export async function addAllowedDoc({ documentName, description }, token) {
  const response = await fetch(`${API_BASE}/allow_doc`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ doc_name: documentName, description }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to add allowed document");
  return data;
}

export async function deleteAllowedDoc(id, token) {
  const response = await fetch(`${API_BASE}/allow_doc/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete allowed document");
  return response;
}

export async function fetchMap(token) {
  const response = await fetch(`${API_BASE}/mapping`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch map");
  return response.json();
}

export async function addMapping(mappingData, token) {
  const response = await fetch(`${API_BASE}/mapping`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mappingData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to add mapping");
  return data;
}

export async function deleteMapping(id, token) {
  const response = await fetch(`${API_BASE}/mapping/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to delete mapping");
  return response;
}

export async function updateMappingVisibility(id, visibility, token) {
  const response = await fetch(`${API_BASE}/mapping/visibility/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ visibility }),
  });
  if (!response.ok) throw new Error("Failed to update mapping visibility");
  return response;
}

export async function updateMapping(id, data, token) {
  const response = await fetch(`${API_BASE}/mapping/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update mapping");
  return response.json();
}
