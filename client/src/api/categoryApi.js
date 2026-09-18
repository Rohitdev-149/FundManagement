import axiosClient from "./axiosClient";

export const getCategories = (eventId) =>
  axiosClient.get(`/categories?eventId=${eventId}`);
export const createCategory = (data) => axiosClient.post("/categories", data);
export const updateCategory = (id, data) =>
  axiosClient.put(`/categories/${id}`, data);
