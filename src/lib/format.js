const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(amount) {
  return nairaFormatter.format(amount);
}

export function maskAccountNumber(accountNumber) {
  if (!accountNumber) return "";
  const last4 = accountNumber.slice(-4);
  return `**** **** ${last4}`;
}
