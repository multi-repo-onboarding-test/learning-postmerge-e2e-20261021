import test from "node:test";
import assert from "node:assert/strict";
import { getVenueRoom } from "../src/resources/venue-rooms.js";
import { HttpStatusError } from "../src/http-status-error.js";

const baseUrl = "https://api.example.test";

test("getVenueRoom: reads a nested resource and encodes both identifiers", async () => {
  const record = { id: "child/one", label: "Primary" };
  const requests = [];
  const actual = await getVenueRoom("parent/one", record.id, {
    baseUrl,
    fetchImpl: async (url, options) => {
      requests.push({ url: String(url), method: options.method });
      return Response.json(record);
    },
  });
  assert.deepEqual(actual, record);
  assert.deepEqual(requests, [{
    url: `${baseUrl}/v1/venues/parent%2Fone/rooms/child%2Fone`,
    method: "GET",
  }]);
});

test("getVenueRoom: reports an absent resource without parsing its error body", async () => {
  assert.equal(await getVenueRoom("parent", "missing", {
    baseUrl,
    fetchImpl: async () => new Response("Not found", { status: 404 }),
  }), undefined);
});

test("getVenueRoom: preserves the original transport failure", async () => {
  const failure = new Error("Connection interrupted");
  await assert.rejects(getVenueRoom("parent", "child", {
    baseUrl,
    fetchImpl: async () => { throw failure; },
  }), error => error === failure);
});

for (const status of [401, 403, 429, 500, 503]) {
  test(`getVenueRoom: preserves HTTP ${status} rather than reporting absence`, async () => {
    let requests = 0;
    await assert.rejects(getVenueRoom("parent", "child", {
      baseUrl,
      fetchImpl: async () => {
        requests += 1;
        return new Response("Request rejected", { status });
      },
    }), error => {
      assert.ok(error instanceof HttpStatusError);
      assert.equal(error.status, status);
      return true;
    });
    assert.equal(requests, 1);
  });
}
