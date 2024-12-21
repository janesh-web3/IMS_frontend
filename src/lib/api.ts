import { server } from "@/server";
import axios, { AxiosRequestConfig, Method } from "axios";
import { toast } from "react-toastify";

// src/services/crudRequest.ts
const token = sessionStorage.getItem("token");

const axiosInstance = axios.create({
  baseURL: server,
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
    Authorization: token,
  },
});

export const crudRequest = async <T>(
  method: Method,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axiosInstance.request<T>({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const moveToRecycleBin = async (type: string, id: string) => {
  try {
    await crudRequest("PUT", `/recycle/move-to-bin/${type}/${id}`);
    toast.success("Item moved to recycle bin");
    return true;
  } catch (error) {
    toast.error("Failed to move item to recycle bin");
    console.error("Error moving to recycle bin:", error);
    return false;
  }
};
