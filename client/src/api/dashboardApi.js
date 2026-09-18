import axiosClient from "./axiosClient";

export const getDashboard = (eventId) =>
  axiosClient.get(`/events/${eventId}/dashboard`);
export const getCategoryWiseReport = (eventId) =>
  axiosClient.get(`/events/${eventId}/reports/category-wise`);
export const getDateWiseReport = (eventId) =>
  axiosClient.get(`/events/${eventId}/reports/date-wise`);
export const getBudgetVsActual = (eventId) =>
  axiosClient.get(`/events/${eventId}/reports/budget-vs-actual`);
