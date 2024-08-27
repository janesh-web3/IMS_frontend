import axios, { AxiosRequestConfig, Method } from "axios";

export async function getStudents(
  offset: number,
  pageLimit: number,
  country: string
) {
  try {
    const res = await axios.get(
      `https://api.slingacademy.com/v1/sample-data/users?offset=${offset}&limit=${pageLimit}` +
        (country ? `&search=${country}` : "")
    );
    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// src/services/crudRequest.ts
const token = sessionStorage.getItem("token");

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
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
