import assert from "node:assert/strict";

const CASHOUT_TARGET = 2.5;
const cashoutProgressForBalance = (balance) => {
  if (!Number.isFinite(balance) || balance <= 0) return 0;
  return Math.min((balance / CASHOUT_TARGET) * 100, 100);
};

assert.equal(cashoutProgressForBalance(0), 0);
assert.equal(cashoutProgressForBalance(-1), 0);
assert.equal(cashoutProgressForBalance(Number.NaN), 0);
assert.equal(cashoutProgressForBalance(1.25), 50);
assert.equal(cashoutProgressForBalance(CASHOUT_TARGET), 100);
assert.equal(cashoutProgressForBalance(4), 100);

console.log("Cashout progress states passed");
