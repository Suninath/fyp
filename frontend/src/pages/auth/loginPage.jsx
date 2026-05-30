import { lazy } from "react";

const LoginComponent = lazy(() =>
  import("../../components/authComp/loginComponent")
);

function login() {
  return <LoginComponent />;
}

export default login;
