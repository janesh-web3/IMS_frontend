import { useEffect } from "react";
import AppProvider from "./providers";
import AppRouter from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { crudRequest } from "./lib/api";

export default function App() {
  useEffect(() => {
    // Track when user closes the browser/tab
    const handleWindowClose = async () => {
      const logoutTime = new Date();
      await crudRequest("POST", "/session/end", {
        logoutTime,
      });
    };

    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, []);
  return (
    <AppProvider>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <AppRouter />
    </AppProvider>
  );
}
