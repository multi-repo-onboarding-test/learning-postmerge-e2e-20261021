export async function getProject(id, { baseUrl, fetchImpl }) {
  const url = new URL(`/v1/projects/${encodeURIComponent(id)}`, baseUrl);
  const response = await fetchImpl(url, { method: "GET" });

  if (!response.ok) {
    return undefined;
  }

  return response.json();
}
