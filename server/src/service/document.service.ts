import AppDataSource from "../config/db.config";
import { DocumentEntity, DOCUMENT_TYPE, VERIFICATION_STATUS } from "../entities/document.entity";
import { UserEntity } from "../entities/user.entity";
import { AuthEntity } from "../entities/auth.entity";
import cloudinary from "../config/cloudinary.config";
import { Request } from "express";
import * as fs from "fs";
import { USER_ROLE } from "../constant/enums";
import { notificationService } from "./notification.service";
import { NOTIFICATION_TYPE } from "../entities/notification.entity";

const documentRepository = AppDataSource.getRepository(DocumentEntity);
const userRepository = AppDataSource.getRepository(UserEntity);
const authRepository = AppDataSource.getRepository(AuthEntity);

const safeNotify = async (callback: () => Promise<unknown>) => {
  try {
    await callback();
  } catch (error) {
    console.error("Notification dispatch failed:", error);
  }
};

// Upload document to Cloudinary
const uploadDocumentToCloudinary = async (file: Express.Multer.File): Promise<string> => {
  try {
    console.log("Uploading file to Cloudinary:", {
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    });

    if (!file.path) {
      throw new Error("File path is not available");
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "verification-documents",
      resource_type: "auto", // Supports PDF, images, etc.
    });

    console.log("Cloudinary upload success:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary document upload error:", error);
    throw new Error(`Failed to upload document: ${file.originalname}`);
  }
};

export const documentService = {
  // Upload document for verification
  async uploadDocument(userId: number, documentType: DOCUMENT_TYPE, req: any) {
    try {
      console.log("Document upload started:", { userId, documentType });

      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ["auth"],
      });

      if (!user) {
        console.log("User not found:", userId);
        return {
          status: false,
          code: 404,
          message: "User not found",
        };
      }

      console.log("User found:", user.id);

      const file = req.file as Express.Multer.File;
      if (!file) {
        console.log("No file provided in request");
        console.log("Request files:", (req as any).files);
        return {
          status: false,
          code: 400,
          message: "No file provided",
        };
      }

      console.log("File received:", file.filename);

      // Upload to Cloudinary
      const documentUrl = await uploadDocumentToCloudinary(file);

      // Clean up temporary file after upload
      try {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log("Temporary file deleted:", file.path);
        }
      } catch (err) {
        console.warn("Could not delete temporary file:", err);
      }

      console.log("Creating document record...");

      // Create document record
      const document = documentRepository.create({
        userId,
        documentType,
        documentUrl,
        verificationStatus: VERIFICATION_STATUS.PENDING,
      });

      console.log("Saving document...", document);

      const savedDocument = await documentRepository.save(document);

      console.log("Document saved successfully:", savedDocument.id);

      // Verify document was actually saved by querying directly
      const verifyDocument = await documentRepository.findOne({
        where: { id: savedDocument.id },
      });

      console.log("Document verification check:", verifyDocument);

      if (!verifyDocument) {
        console.error("ERROR: Document was not saved to database!");
        return {
          status: false,
          code: 500,
          message: "Failed to save document to database",
        };
      }

      // Also verify by checking user's documents
      const userWithDocs = await userRepository.findOne({
        where: { id: userId },
        relations: ["documents"],
      });

      console.log("User documents after save:", {
        userId,
        documentCount: userWithDocs?.documents?.length || 0,
        documents: userWithDocs?.documents,
      });

      await safeNotify(() =>
        notificationService.createForAdmins({
          type: NOTIFICATION_TYPE.DOCUMENT_SUBMITTED,
          title: "New verification document",
          message: `User #${userId} submitted a ${documentType} document for review.`,
          data: {
            documentId: savedDocument.id,
            userId,
            route: "/admin/verification",
          },
        })
      );

      return {
        status: true,
        code: 201,
        message: "Document uploaded successfully",
        data: savedDocument,
      };
    } catch (error) {
      console.error("Error uploading document:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Get user's documents
  async getUserDocuments(userId: number) {
    try {
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return {
          status: false,
          code: 404,
          message: "User not found",
        };
      }

      const documents = await documentRepository.find({
        where: { userId },
        order: { createdAt: "DESC" },
      });

      return {
        status: true,
        code: 200,
        message: "Documents retrieved successfully",
        data: documents,
      };
    } catch (error) {
      console.error("Error retrieving documents:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Get document by ID
  async getDocumentById(documentId: number) {
    try {
      const document = await documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        return {
          status: false,
          code: 404,
          message: "Document not found",
        };
      }

      return {
        status: true,
        code: 200,
        message: "Document retrieved successfully",
        data: document,
      };
    } catch (error) {
      console.error("Error retrieving document:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Delete document
  async deleteDocument(documentId: number, userId: number) {
    try {
      const document = await documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        return {
          status: false,
          code: 404,
          message: "Document not found",
        };
      }

      // Verify ownership
      if (document.userId !== userId) {
        return {
          status: false,
          code: 403,
          message: "Unauthorized to delete this document",
        };
      }

      // Delete from Cloudinary
      try {
        const publicId = document.documentUrl.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`verification-documents/${publicId}`, {
            resource_type: "auto",
          });
        }
      } catch (err) {
        console.warn("Warning: Could not delete from Cloudinary:", err);
      }

      // Delete from database
      await documentRepository.remove(document);

      return {
        status: true,
        code: 200,
        message: "Document deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting document:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Get all documents with optional status filter (for admin)
  async getAllDocuments(page: number = 1, limit: number = 10, status?: string) {
    try {
      const skip = (page - 1) * limit;
      const queryBuilder = documentRepository
        .createQueryBuilder("document")
        .innerJoinAndSelect("document.user", "user")
        .innerJoinAndSelect("user.auth", "auth")
        .orderBy("document.createdAt", "DESC")
        .skip(skip)
        .take(limit);

      if (status && status !== "all") {
        queryBuilder.andWhere("document.verificationStatus = :status", {
          status,
        });
      }

      const [documents, total] = await queryBuilder.getManyAndCount();

      return {
        status: true,
        code: 200,
        message: "Documents retrieved successfully",
        data: documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error retrieving documents:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Get pending documents (for admin verification)
  async getPendingDocuments(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [documents, total] = await documentRepository
        .createQueryBuilder("document")
        .innerJoinAndSelect("document.user", "user")
        .innerJoinAndSelect("user.auth", "auth")
        .where("document.verificationStatus = :status", {
          status: VERIFICATION_STATUS.PENDING,
        })
        .orderBy("document.createdAt", "ASC")
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        status: true,
        code: 200,
        message: "Pending documents retrieved successfully",
        data: documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error retrieving pending documents:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Verify document (admin)
  async verifyDocument(
    documentId: number,
    adminId: number,
    approvalStatus: VERIFICATION_STATUS,
    rejectionReason?: string
  ) {
    try {
      const document = await documentRepository.findOne({
        where: { id: documentId },
        relations: ["user", "user.auth"],
      });

      if (!document) {
        return {
          status: false,
          code: 404,
          message: "Document not found",
        };
      }

      // Update document
      document.verificationStatus = approvalStatus;
      document.verifiedBy = adminId;
      document.verifiedAt = new Date();
      if (rejectionReason) {
        document.rejectionReason = rejectionReason;
      }

      await documentRepository.save(document);

      // Check if all documents are verified and update user account status
      if (approvalStatus === VERIFICATION_STATUS.APPROVED) {
        const pendingDocs = await documentRepository.find({
          where: {
            userId: document.userId,
            verificationStatus: VERIFICATION_STATUS.PENDING,
          },
        });

        // If no more pending documents, mark account as verified
        if (pendingDocs.length === 0) {
          const user = document.user;
          if (user.auth) {
            user.auth.accountVerified = true;
            user.auth.verificationRejected = false;
            await authRepository.save(user.auth);
          }
        }
      }

      // If rejected, mark account verification as rejected
      if (approvalStatus === VERIFICATION_STATUS.REJECTED) {
        const user = document.user;
        if (user.auth) {
          user.auth.verificationRejected = true;
          user.auth.rejectionReason = rejectionReason || "Document verification failed";
          await authRepository.save(user.auth);
        }
      }

      await safeNotify(() =>
        notificationService.createNotification({
          recipientId: document.userId,
          recipientRole: USER_ROLE.USER,
          type: NOTIFICATION_TYPE.DOCUMENT_VERIFIED,
          title:
            approvalStatus === VERIFICATION_STATUS.APPROVED
              ? "Document approved"
              : "Document rejected",
          message:
            approvalStatus === VERIFICATION_STATUS.APPROVED
              ? `Your ${document.documentType} document was approved.`
              : `Your ${document.documentType} document was rejected.${
                  rejectionReason ? ` Reason: ${rejectionReason}` : ""
                }`,
          data: {
            documentId: document.id,
            status: approvalStatus,
            route: "/profile",
          },
        })
      );

      return {
        status: true,
        code: 200,
        message: "Document verification updated successfully",
        data: document,
      };
    } catch (error) {
      console.error("Error verifying document:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Get verification status
  async getVerificationStatus(userId: number) {
    try {
      console.log("Getting verification status for user:", userId);

      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ["auth", "documents"],
      });

      if (!user) {
        console.log("User not found:", userId);
        return {
          status: false,
          code: 404,
          message: "User not found",
        };
      }

      console.log("User found, documents:", user.documents?.length || 0);

      let documents = user.documents || [];

      // Auto-sync: If account is verified but has pending documents, approve them
      if (user.auth?.accountVerified && documents.length > 0) {
        const pendingDocs = documents.filter(
          (d) => d.verificationStatus === VERIFICATION_STATUS.PENDING
        );
        if (pendingDocs.length > 0) {
          console.log(`🔄 Auto-syncing ${pendingDocs.length} pending documents for verified account`);
          for (const doc of pendingDocs) {
            doc.verificationStatus = VERIFICATION_STATUS.APPROVED;
            doc.verifiedAt = new Date();
            await documentRepository.save(doc);
          }
          // Refresh documents list
          const refreshedUser = await userRepository.findOne({
            where: { id: userId },
            relations: ["documents"],
          });
          documents = refreshedUser?.documents || [];
        }
      }

      const pendingCount = documents.filter(
        (d) => d.verificationStatus === VERIFICATION_STATUS.PENDING
      ).length;
      const approvedCount = documents.filter(
        (d) => d.verificationStatus === VERIFICATION_STATUS.APPROVED
      ).length;
      const rejectedDocs = documents.filter(
        (d) => d.verificationStatus === VERIFICATION_STATUS.REJECTED
      );

      console.log("Verification status data:", {
        total: documents.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedDocs.length,
      });

      return {
        status: true,
        code: 200,
        message: "Verification status retrieved successfully",
        data: {
          accountVerified: user.auth?.accountVerified || false,
          verificationRejected: user.auth?.verificationRejected || false,
          rejectionReason: user.auth?.rejectionReason || null,
          documentsUploaded: documents.length,
          documentsPending: pendingCount,
          documentsApproved: approvedCount,
          rejectedDocuments: rejectedDocs.map((d) => ({
            id: d.id,
            type: d.documentType,
            reason: d.rejectionReason,
            documentUrl: d.documentUrl,
          })),
          documents: documents.map((d) => ({
            id: d.id,
            type: d.documentType,
            status: d.verificationStatus,
            reason: d.rejectionReason,
            documentUrl: d.documentUrl,
            createdAt: d.createdAt,
          })),
        },
      };
    } catch (error) {
      console.error("Error getting verification status:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },
};
