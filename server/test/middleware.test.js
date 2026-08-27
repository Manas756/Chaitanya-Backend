const test = require("node:test");
const assert = require("node:assert/strict");
const auth = require("../middleware/authmiddleware");
const admin = require("../middleware/adminmiddleware");

const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("auth middleware rejects requests without a bearer token", async () => {
  const res = response();
  let called = false;
  await auth({ headers: {} }, res, () => { called = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(called, false);
});

test("admin middleware rejects ordinary users", () => {
  const res = response();
  let called = false;
  admin({ user: { role: "user" } }, res, () => { called = true; });
  assert.equal(res.statusCode, 403);
  assert.equal(called, false);
});

test("admin middleware allows administrators", () => {
  const res = response();
  let called = false;
  admin({ user: { role: "admin" } }, res, () => { called = true; });
  assert.equal(called, true);
});