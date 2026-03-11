import { main_uri, photo_url } from "./index";

// Upload document
export const uploadDocument = async (documentType, file) => {
  try {
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);

    const response = await photo_url.post(
      "/api/v1/documents/upload",
      formData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's documents
export const getUserDocuments = async () => {
  try {
    const response = await main_uri.get("/api/v1/documents/my-documents");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get verification status
export const getVerificationStatus = async () => {
  try {
    const response = await main_uri.get("/api/v1/documents/status");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single document
export const getDocument = async (documentId) => {
  try {
    const response = await main_uri.get(`/api/v1/documents/${documentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete document
export const deleteDocument = async (documentId) => {
  try {
    const response = await main_uri.delete(`/api/v1/documents/${documentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Get pending documents
export const getPendingDocuments = async (page = 1, limit = 10) => {
  try {
    const response = await main_uri.get(
      `/api/v1/documents/admin/pending?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Verify document
export const verifyDocument = async (documentId, status, rejectionReason = null) => {
  try {
    const response = await main_uri.put(
      `/api/v1/documents/${documentId}/verify`,
      {
        status,
        rejectionReason,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
