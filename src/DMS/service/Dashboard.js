const API_BASE = process.env.REACT_APP_API_BASE_URL;

export async function fetchDocumentTree(userId, token) {
  const response = await fetch(`${API_BASE}/dmsapi/DocumentTree/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed, similar to other services
      Authorization: `Bearer ${token}`, 
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch document tree");
  }

  return response.json();
}
