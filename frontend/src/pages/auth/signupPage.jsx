import { lazy } from "react";

const SignupComponent = lazy(() =>
  import("../../components/authComp/signupComponent")
);

function Signup() {
  return <SignupComponent />;
}

export default Signup;
