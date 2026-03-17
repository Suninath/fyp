import { Router } from "express";
import { documentController } from "../controller/document.controller";
import { authenticationMiddeware } from "../middleware/authMiddleware";
import { uploadDocumentWithFields } from "../middleware/multerMiddleware";

const router = Router();

// User routes
router.post(
  "/upload",
  authenticationMiddeware,
  uploadDocumentWithFields,
  documentController.uploadDocument
);

router.get("/my-documents", authenticationMiddeware, documentController.getUserDocuments);

router.get("/status", authenticationMiddeware, documentController.getVerificationStatus);

router.get("/:documentId", authenticationMiddeware, documentController.getDocument);

router.delete("/:documentId", authenticationMiddeware, documentController.deleteDocument);

// Admin routes
router.get("/admin/all", authenticationMiddeware, documentController.getAllDocuments);
router.get("/admin/pending", authenticationMiddeware, documentController.getPendingDocuments);

router.put("/:documentId/verify", authenticationMiddeware, documentController.verifyDocument);

export default router;
