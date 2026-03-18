const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  getOpenApiDocument,
  openApiJsonHandler,
  scalarDocsHandler,
} = require("../dist/docs/openapi");

test("OpenAPI document includes servers and representative paths", () => {
  const document = getOpenApiDocument();

  assert.equal(document.openapi, "3.1.0");
  assert.ok(Array.isArray(document.servers));
  assert.ok(document.servers.length > 0);
  assert.equal(document.servers[0].url, "http://localhost:3001");
  assert.ok(document.paths["/api/auth/login"]);
  assert.ok(document.paths["/api/campaigns"]);
  assert.ok(document.components.securitySchemes.BearerAuth);
});

test("OpenAPI document includes success and error examples", () => {
  const document = getOpenApiDocument();
  const loginPath = document.paths["/api/auth/login"].post;
  const getMePath = document.paths["/api/auth/me"].get;

  assert.equal(
    loginPath.responses["200"].content["application/json"].example.success,
    true,
  );
  assert.equal(
    loginPath.responses["422"].content["application/json"].example.message,
    "Validation failed",
  );
  assert.ok(Array.isArray(getMePath.security));
  assert.equal(getMePath.security[0].BearerAuth.length, 0);
});

test("GET /openapi.json handler returns the generated document", async () => {
  let payload = null;
  const res = {
    json(body) {
      payload = body;
      return this;
    },
  };

  await openApiJsonHandler({}, res);

  assert.equal(payload.info.title, "Influencer Marketplace API");
  assert.ok(payload.paths["/api/offers/{offerId}/accept"]);
});

test("GET /docs handler returns Scalar HTML", async () => {
  let contentType = null;
  let html = null;
  const res = {
    type(value) {
      contentType = value;
      return this;
    },
    send(body) {
      html = body;
      return this;
    },
  };

  await scalarDocsHandler({}, res);

  assert.equal(contentType, "text/html");
  assert.match(html, /Influencer Marketplace API/);
  assert.match(html, /\/openapi\.json/);
});
