const assert = require("node:assert/strict");
const { test } = require("node:test");

const app = require("../dist/app").default;

test("GET /health returns service health details", async () => {
  const healthLayer = app.router.stack.find(
    (layer) => layer.route && layer.route.path === "/health",
  );

  assert.ok(healthLayer, "health route should be registered");

  const handler = healthLayer.route.stack[0].handle;
  const req = { method: "GET", url: "/health" };
  let statusCode = 200;
  let payload = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      payload = body;
      return this;
    },
  };

  await handler(req, res);

  assert.equal(statusCode, 200);
  assert.equal(payload.status, "ok");
  assert.equal(payload.service, "influencer-marketplace-api");
  assert.ok(payload.timestamp);
});
