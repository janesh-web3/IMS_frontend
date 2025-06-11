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

// Maximum number of retries for network requests
const MAX_RETRIES = 2;

// Add debounce mechanism
const pendingRequests: Record<string, Promise<any> | undefined> = {};

export const crudRequest = async <T>(
  method: Method,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
  retryCount = 0
): Promise<T> => {
  try {
    // Create a unique key for this request
    const requestKey = `${method}:${url}:${JSON.stringify(data || {})}`;
    
    // If there's already a pending request with the same key, return that promise
    if (pendingRequests[requestKey]) {
      console.log(`Using pending request for ${requestKey}`);
      return pendingRequests[requestKey] as Promise<T>;
    }
    
    // Create the request promise
    const requestPromise = (async () => {
      try {
        const response = await axiosInstance.request<T>({
          method,
          url,
          data,
          ...config,
        });
        return response.data;
      } finally {
        // Remove from pending requests when done (success or failure)
        setTimeout(() => {
          delete pendingRequests[requestKey];
        }, 0);
      }
    })();
    
    // Store the promise
    pendingRequests[requestKey] = requestPromise;
    
    return await requestPromise;
  } catch (error: any) {
    // Network errors or server unavailable (status 0)
    const isNetworkError = !error.response || error.code === 'ECONNABORTED' || 
      (error.response && (error.response.status === 0 || error.response.status === 503 || error.response.status === 504));
    
    // If it's a network error and we haven't exceeded max retries
    if (isNetworkError && retryCount < MAX_RETRIES) {
      console.log(`Network error, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = 1000 * Math.pow(2, retryCount);
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(crudRequest<T>(method, url, data, config, retryCount + 1));
        }, delay);
      });
    }
    
    // If it's not a network error or we've exceeded retries, throw the error
    throw error.response ? error.response.data : error.message;
  }
};

export const moveToRecycleBin = async (type: string, id: string) => {
  try {
    await crudRequest("PUT", `/recycle/move-to-bin/${type}/${id}`);
    toast.success("Item moved to recycle bin");
    window.location.reload();
    return true;
  } catch (error) {
    toast.error("Failed to move item to recycle bin");
    console.error("Error moving to recycle bin:", error);
    return false;
  }
};
