import toast from "react-hot-toast";

export const SucessToast = ({ message }) => {
  return toast.success(message, {
    style: {
      border: "1px solid #00b300",
      padding: "16px",
      color: "white",
      backgroundColor: "#00b300",
      borderRadius: "12px",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "white",
      secondary: "#00b300",
    },
    duration: 2000,
  });
};

export const ErrorToast = ({ message }) => {
  return toast.error(message, {
    style: {
      border: "1px solid #e50000",
      padding: "16px",
      color: "white",
      backgroundColor: "#e50000",
      borderRadius: "12px",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "white",
      secondary: "#e50000",
    },
    duration: 2000,
  });
};

export const InfoToast = ({ message }) => {
  return toast(message, {
    style: {
      border: "1px solid #0096FF",
      padding: "16px",
      color: "white",
      backgroundColor: "#0096FF",
      borderRadius: "12px",
      fontWeight: "500",
    },
    icon: "ℹ️",
    duration: 2000,
  });
};

export const WarningToast = ({ message }) => {
  return toast(message, {
    style: {
      border: "1px solid #F59E0B",
      padding: "16px",
      color: "white",
      backgroundColor: "#F59E0B",
      borderRadius: "12px",
      fontWeight: "500",
    },
    icon: "⚠️",
    duration: 2000,
  });
};
