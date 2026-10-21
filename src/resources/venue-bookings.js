import { HttpStatusError } from "../http-status-error.js";

export async function getVenueBooking(parentId, id, { baseUrl, fetchImpl }) {
  const url = new URL(
    `/v1/venues/${encodeURIComponent(parentId)}/bookings/${encodeURIComponent(id)}`,
    baseUrl,
  );
  const response = await fetchImpl(url, { method: "GET" });

  if (response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    throw new HttpStatusError(response.status);
  }

  return response.json();
}
