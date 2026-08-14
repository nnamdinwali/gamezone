import assert from "node:assert/strict";

const regionCurrency = {
  NG: "NGN",
  US: "USD",
  GB: "GBP",
};

function currencyForCountry(countryCode) {
  return regionCurrency[countryCode?.toUpperCase()] ?? "USD";
}

function format(amount, currency, locale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

assert.equal(currencyForCountry("ng"), "NGN");
assert.equal(currencyForCountry("US"), "USD");
assert.equal(currencyForCountry("unknown"), "USD");
assert.match(format(0, "NGN", "en-NG"), /₦|NGN/);
assert.match(format(0, "USD", "en-US"), /\$/);
assert.match(format(3401.4, "NGN", "en-NG"), /3,401\.40|3401\.40/);
assert.match(format(2.5, "USD", "en-US"), /\$2\.50/);

console.log("currency display contract passed");
