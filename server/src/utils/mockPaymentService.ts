/**
 * Mock Payment Service for Local Development
 * 
 * This service intercepts payment API calls and returns mock responses
 * Enable this in development to avoid DNS issues with eSewa UAT
 */

export const mockPaymentService = {
  /**
   * Mock eSewa Verification Response
   * Simulates: https://rc.esewa.com.np/api/epay/transaction/status/
   */
  mockEsewaVerification: (params: any) => {
    console.log("🎭 Mock eSewa Verification called with params:", params);
    
    // Simulate successful payment verification
    return {
      status: "COMPLETE",
      oid: params.pid || "mock_order_id",
      refId: params.rid || "0000001234",
      amount: params.amt || "1000",
      message: "Success. Transaction Completed.",
      transaction_uuid: params.pid,
    };
  },


};

/**
 * Axios Interceptor for Mock Payments
 * Add this to your axios instance to mock payment API calls
 * 
 * Usage:
 * ```typescript
 * import axios from 'axios';
 * import { setupMockPaymentInterceptor } from './utils/mockPaymentService';
 * 
 * const instance = axios.create();
 * setupMockPaymentInterceptor(instance);
 * ```
 */
export const setupMockPaymentInterceptor = (axiosInstance: any) => {
  if (process.env.NODE_ENV !== "development" || !process.env.MOCK_PAYMENTS) {
    return;
  }

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const config = error.config;

      // Mock eSewa endpoints
      if (config.url?.includes("uat.esewa.com.np")) {
        console.log("🎭 Intercepting eSewa request:", config.url);

        if (config.url.includes("transactionStatus")) {
          return Promise.resolve({
            status: 200,
            data: mockPaymentService.mockEsewaVerification(config.params),
          });
        }
      }

      // If it's not a payment API, pass through the error
      return Promise.reject(error);
    }
  );
};
