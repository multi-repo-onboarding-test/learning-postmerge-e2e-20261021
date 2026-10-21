export async function getVenue(id, { baseUrl, fetchImpl }) {
  const url = new URL(`/v1/venues/${encodeURIComponent(id)}`, baseUrl);
  const response = await fetchImpl(url, { method: "GET" });

  if (!response.ok) {
    return undefined;
  }

  return response.json();
}
