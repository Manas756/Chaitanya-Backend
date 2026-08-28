const crypto = require("crypto");

function generateOTP(length = 6) {
  if (!Number.isInteger(length) || length < 4 || length > 10) throw new Error("Invalid OTP length");
  const min = 10 ** (length - 1);
  const max = 10 ** length;
  return crypto.randomInt(min, max).toString();
}

module.exports = generateOTP;