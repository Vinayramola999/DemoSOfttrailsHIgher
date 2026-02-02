const API_BASE = process.env.REACT_APP_API_BASE_URL;

export async function fetchFolderData(token, prefix = "./") {
  const resp = await fetch(
    `${API_BASE}/dmsapi/list?prefix=${encodeURIComponent(prefix)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!resp.ok) throw new Error("Failed to fetch folder data");
  return resp.json();
}
