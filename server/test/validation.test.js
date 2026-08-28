const test = require("node:test");
const assert = require("node:assert/strict");
const { isObjectId, parsePagination } = require("../middleware/validation");
const generateOTP = require("../utils/generateotp");

test("pagination has bounded defaults and rejects oversized limits", () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 20, skip: 0 });
  assert.equal(parsePagination({ limit: "1000" }).error, "limit must be an integer between 1 and 100");
});

test("ObjectId validation rejects malformed identifiers", () => {
  assert.equal(isObjectId("507f1f77bcf86cd799439011"), true);
  assert.equal(isObjectId("not-an-id"), false);
});

test("OTP generation returns a six digit numeric code", () => {
  const otp = generateOTP();
  assert.match(otp, /^\d{6}$/);
});