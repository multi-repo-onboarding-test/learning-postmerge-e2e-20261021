import { HttpStatusError } from "../http-status-error.js";

export async function getProjectDeployment(parentId, id, { baseUrl, fetchImpl }) {
  if (parentId === "." || parentId === ".." || id === "." || id === "..") {
    throw new TypeError("Resource identifiers must not be dot segments");
  }
  const url = new URL(
    `/v1/projects/${encodeURIComponent(parentId)}/deployments/${encodeURIComponent(id)}`,
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
