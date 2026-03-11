import axios from "axios";
import { mockPaymentService } from "./mockPaymentService";

/**
 * Axios instance for making HTTP requests
 * Automatically includes mock payment interceptors in development
 */
export const axiosInstance = axios.create({
  timeout: 10000,
});

// Setup mock payment interceptor for development
if (process.env.NODE_ENV === "development" || process.env.MOCK_PAYMENTS === "true") {
  console.log("📦 Setting up mock payment interceptor...");
  
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const config = error.config;
      
      if (!config) {
        return Promise.reject(error);
      }

      console.log("🔍 Axios interceptor checking URL:", config.url);

      // Mock eSewa endpoints
      if (config.url?.includes("rc.esewa.com.np")) {
        console.log("🎭 Intercepting eSewa request:", config.url);

        if (config.url.includes("transaction/status")) {
          return Promise.resolve({
            status: 200,
            data: mockPaymentService.mockEsewaVerification(config.params),
          });
        }
      }

      // If it's not a payment API or not in mock mode, pass through the error
      return Promise.reject(error);
    }
  );
}

export default axiosInstance;
