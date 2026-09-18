import axiosClient from "./axiosClient";

export const getEvents = () => axiosClient.get("/events");
export const createEvent = (data) => axiosClient.post("/events", data);
export const updateEvent = (id, data) => axiosClient.put(`/events/${id}`, data);
