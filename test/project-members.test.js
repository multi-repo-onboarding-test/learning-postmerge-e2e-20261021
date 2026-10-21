import test from "node:test";
import assert from "node:assert/strict";
import { getProjectMember } from "../src/resources/project-members.js";
import { HttpStatusError } from "../src/http-status-error.js";

const baseUrl = "https://api.example.test";

test("getProjectMember: reads a nested resource and encodes both identifiers", async () => {
  const record = { id: "child/one", label: "Primary" };
  const requests = [];
  const actual = await getProjectMember("parent/one", record.id, {
    baseUrl,
    fetchImpl: async (url, options) => {
      requests.push({ url: String(url), method: options.method });
      return Response.json(record);
    },
  });
  assert.deepEqual(actual, record);
  assert.deepEqual(requests, [{
    url: `${baseUrl}/v1/projects/parent%2Fone/members/child%2Fone`,
    method: "GET",
  }]);
});

test("getProjectMember: reports an absent resource without parsing its error body", async () => {
  assert.equal(await getProjectMember("parent", "missing", {
    baseUrl,
    fetchImpl: async () => new Response("Not found", { status: 404 }),
  }), undefined);
});

test("getProjectMember: preserves the original transport failure", async () => {
  const failure = new Error("Connection interrupted");
  await assert.rejects(getProjectMember("parent", "child", {
    baseUrl,
    fetchImpl: async () => { throw failure; },
  }), error => error === failure);
});

for (const status of [401, 403, 429, 500, 503]) {
  test(`getProjectMember: preserves HTTP ${status} rather than reporting absence`, async () => {
    let requests = 0;
    await assert.rejects(getProjectMember("parent", "child", {
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
