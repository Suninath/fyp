import React from "react";
import AdminLayout from "./AdminLayout";
import AdminDocumentReviewComponent from "../../../components/adminComp/AdminDocumentReviewComponent";

const DocumentManagement = () => {
  return (
    <AdminLayout activeTab="documents">
      <AdminDocumentReviewComponent />
    </AdminLayout>
  );
};

export default DocumentManagement;
