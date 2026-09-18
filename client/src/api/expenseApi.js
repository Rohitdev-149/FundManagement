import axiosClient from "./axiosClient";

export const getExpenses = (eventId, filters = {}) => {
  const params = new URLSearchParams({ eventId, ...filters }).toString();
  return axiosClient.get(`/expenses?${params}`);
};
export const createExpense = (data) => axiosClient.post("/expenses", data);
export const updateExpense = (id, data) =>
  axiosClient.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => axiosClient.delete(`/expenses/${id}`);
