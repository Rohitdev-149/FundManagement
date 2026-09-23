import axiosClient from "./axiosClient";

export const createUser = (data) => axiosClient.post("/auth/create-user", data);
export const getUsers = () => axiosClient.get("/auth/users");
export const updateUserRole = (id, role) =>
  axiosClient.put(`/auth/users/${id}/role`, { role });
export const updateUser = (id, data) =>
  axiosClient.put(`/auth/users/${id}`, data);
export const deleteUser = (id) => axiosClient.delete(`/auth/users/${id}`);
