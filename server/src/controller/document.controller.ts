import { Request, Response } from "express";
import { documentService } from "../service/document.service";
import { DOCUMENT_TYPE, VERIFICATION_STATUS } from "../entities/document.entity";
import { USER_ROLE } from "../constant/enums";

export const documentController = {
  // Upload document
  async uploadDocument(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { documentType } = req.body;

      console.log("Upload request:", {
        userId,
        documentType,
        body: req.body,
        availableTypes: Object.values(DOCUMENT_TYPE),
      });

      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      if (!documentType) {
        return res.status(400).json({
          status: false,
          message: "Document type is required",
        });
      }

      if (!Object.values(DOCUMENT_TYPE).includes(documentType)) {
        return res.status(400).json({
          status: false,
          message: `Invalid document type. Expected one of: ${Object.values(DOCUMENT_TYPE).join(", ")}. Received: ${documentType}`,
        });
      }

      // Convert files from fields to single file format
      const files = (req as any).files;
      if (!files || !files.file || files.file.length === 0) {
        return res.status(400).json({
          status: false,
          message: "No file provided",
        });
      }

      const file = files.file[0];
      const modifiedReq = { ...req, file };

      const result = await documentService.uploadDocument(userId, documentType, modifiedReq);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  // Get user's documents
  async getUserDocuments(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const result = await documentService.getUserDocuments(userId);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  // Get document by ID
  async getDocument(req: Request, res: Response) {
    try {
      const { documentId } = req.params;

      const result = await documentService.getDocumentById(parseInt(documentId));
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  // Delete document
  async deleteDocument(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { documentId } = req.params;

      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const result = await documentService.deleteDocument(parseInt(documentId), userId);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  // Get verification status
  async getVerificationStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const result = await documentService.getVerificationStatus(userId);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  // Admin: Get all documents with optional status filter
  async getAllDocuments(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;

      if (userRole !== USER_ROLE.ADMIN) {
        return res.status(403).json({ status: false, message: "Forbidden: Admin access required" });
      }

      const result = await documentService.getAllDocuments(page, limit, status);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  },

  // Admin: Get pending documents for verification
  async getPendingDocuments(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Check admin access
      if (userRole !== USER_ROLE.ADMIN) {
        return res.status(403).json({
          status: false,
          message: "Forbidden: Admin access required",
        });
      }

      const result = await documentService.getPendingDocuments(page, limit);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  // Admin: Verify/Reject document
  async verifyDocument(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const { documentId } = req.params;
      const { status, rejectionReason } = req.body;

      if (!adminId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      // Check admin access
      if (userRole !== USER_ROLE.ADMIN) {
        return res.status(403).json({
          status: false,
          message: "Forbidden: Admin access required",
        });
      }

      if (!status || !Object.values(VERIFICATION_STATUS).includes(status)) {
        return res.status(400).json({
          status: false,
          message: "Invalid verification status",
        });
      }

      const result = await documentService.verifyDocument(
        parseInt(documentId),
        adminId,
        status,
        rejectionReason
      );
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },
};
