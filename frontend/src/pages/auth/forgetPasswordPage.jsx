import { lazy } from "react";

const ForgetPasswordComponent = lazy(() =>
  import("../../components/authComp/forgetPasswordComponent")
);

function ForgetPasswordPage() {
  return <ForgetPasswordComponent />;
}

export default ForgetPasswordPage;