import axiosClient from "./axiosClient";

export const getContributions = (eventId, filters = {}) => {
  const params = new URLSearchParams({ eventId, ...filters }).toString();
  return axiosClient.get(`/contributions?${params}`);
};
export const createContribution = (data) =>
  axiosClient.post("/contributions", data);
export const updateContribution = (id, data) =>
  axiosClient.put(`/contributions/${id}`, data);
export const deleteContribution = (id, eventId) =>
  axiosClient.delete(`/contributions/${id}?eventId=${eventId}`);
