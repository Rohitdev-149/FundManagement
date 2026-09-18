export const formatCurrency = (value = 0) => {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `Rs. ${safeAmount.toLocaleString("en-IN")}`;
};

export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN");
};

export const joinDetails = (...parts) => parts.filter(Boolean).join(" | ");
