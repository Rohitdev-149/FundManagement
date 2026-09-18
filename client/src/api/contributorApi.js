import axiosClient from "./axiosClient";

export const getContributors = (eventId) =>
  axiosClient.get(`/contributors?eventId=${eventId}`);
export const createContributor = (data) =>
  axiosClient.post("/contributors", data);
export const updateContributor = (id, data) =>
  axiosClient.put(`/contributors/${id}`, data);
export const deleteContributor = (id) =>
  axiosClient.delete(`/contributors/${id}`);
export const getContributorHistory = (id) =>
  axiosClient.get(`/contributors/${id}/history`);
