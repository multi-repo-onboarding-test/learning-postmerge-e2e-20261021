import test from "node:test";
import assert from "node:assert/strict";
import { getProject } from "../src/resources/projects.js";
import { getVenue } from "../src/resources/venues.js";

const clients = [
  { name: "project", get: getProject, collection: "projects" },
  { name: "venue", get: getVenue, collection: "venues" },
];
const baseUrl = "https://api.example.test";

for (const client of clients) {
  test(`${client.name}: returns the record from a successful GET`, async () => {
    const record = { id: "north/east", name: "North East" };
    const requests = [];
    const actual = await client.get(record.id, {
      baseUrl,
      fetchImpl: async (url, options) => {
        requests.push({ url: String(url), method: options.method });
        return Response.json(record);
      },
    });
    assert.deepEqual(actual, record);
    assert.deepEqual(requests, [
      { url: `${baseUrl}/v1/${client.collection}/north%2Feast`, method: "GET" },
    ]);
  });

  test(`${client.name}: returns undefined for a missing resource`, async () => {
    const actual = await client.get("missing", {
      baseUrl,
      fetchImpl: async () => new Response("Not found", { status: 404 }),
    });
    assert.equal(actual, undefined);
  });

  test(`${client.name}: propagates a transport failure`, async () => {
    const failure = new Error("Connection interrupted");
    await assert.rejects(
      client.get("existing", {
        baseUrl,
        fetchImpl: async () => { throw failure; },
      }),
      error => error === failure,
    );
  });
}
