import test from "node:test";
import assert from "node:assert/strict";
import { getProjectDeployment } from "../src/resources/project-deployments.js";
import { HttpStatusError } from "../src/http-status-error.js";

const baseUrl = "https://api.example.test";

for (const [parentId, id] of [[".", "child"], ["..", "child"], ["parent", "."], ["parent", ".."]]) {
  test(`getProjectDeployment: rejects dot segment identifiers ${JSON.stringify([parentId, id])} before fetch`, async () => {
    let requests = 0;
    await assert.rejects(getProjectDeployment(parentId, id, {
      baseUrl,
      fetchImpl: async () => {
        requests += 1;
        return Response.json({ id });
      },
    }), TypeError);
    assert.equal(requests, 0);
  });
}

test("getProjectDeployment: reads a nested resource and encodes both identifiers", async () => {
  const record = { id: "child/one", label: "Primary" };
  const requests = [];
  const actual = await getProjectDeployment("parent/one", record.id, {
    baseUrl,
    fetchImpl: async (url, options) => {
      requests.push({ url: String(url), method: options.method });
      return Response.json(record);
    },
  });
  assert.deepEqual(actual, record);
  assert.deepEqual(requests, [{
    url: `${baseUrl}/v1/projects/parent%2Fone/deployments/child%2Fone`,
    method: "GET",
  }]);
});

test("getProjectDeployment: reports an absent resource without parsing its error body", async () => {
  assert.equal(await getProjectDeployment("parent", "missing", {
    baseUrl,
    fetchImpl: async () => new Response("Not found", { status: 404 }),
  }), undefined);
});

test("getProjectDeployment: preserves the original transport failure", async () => {
  const failure = new Error("Connection interrupted");
  await assert.rejects(getProjectDeployment("parent", "child", {
    baseUrl,
    fetchImpl: async () => { throw failure; },
  }), error => error === failure);
});

for (const status of [401, 403, 429, 500, 503]) {
  test(`getProjectDeployment: preserves HTTP ${status} rather than reporting absence`, async () => {
    let requests = 0;
    await assert.rejects(getProjectDeployment("parent", "child", {
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
