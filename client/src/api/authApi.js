import axiosClient from "./axiosClient";

export const registerUser = (data) => axiosClient.post("/auth/register", data);
export const loginUser = (data) => axiosClient.post("/auth/login", data);
export const forgotPassword = (data) =>
  axiosClient.post("/auth/forgot-password", data);
export const resetPassword = (data) =>
  axiosClient.post("/auth/reset-password", data);
export const updateProfile = (data) => axiosClient.put("/auth/profile", data);
