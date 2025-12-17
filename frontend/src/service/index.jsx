import axios from "axios";

const MainAxiosInstance = (headers) => {
  return axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}`,
    timeout: 15000,
    headers,
    withCredentials: true,
  });
};

const main_uri = MainAxiosInstance({
  "Content-Type": "application/json",
});

const photo_url = MainAxiosInstance({
  "Content-Type": "multipart/form-data",
});
export { main_uri, photo_url };
