import { lazy } from "react";

const ResetPasswordComponent = lazy(() =>
  import("../../components/authComp/resetPasswordComponent")
);

function ResetPasswordPage() {
  return <ResetPasswordComponent />;
}

export default ResetPasswordPage;