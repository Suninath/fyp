import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <App />
      {/* <ToastContainer /> */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: "1px solid #CBD5E1",
            background: "#FFFFFF",
            color: "#0F172A",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          },
          success: {
            iconTheme: {
              primary: "#0F766E",
              secondary: "#FFFFFF",
            },
          },
          error: {
            iconTheme: {
              primary: "#DC2626",
              secondary: "#FFFFFF",
            },
          },
        }}
      />
    </BrowserRouter>
);
