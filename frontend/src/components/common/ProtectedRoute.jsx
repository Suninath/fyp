import { useEffect, useRef, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthorize, getUserProfile } from "../../rtk/thunk/authThunk";

const AUTH_PAGES = [
  "/login",
  "/signup",
  "/forgetPassword",
  "/resetPassword",
  "/verifyOtp",
];

// Public pages accessible to everyone except admins
const PUBLIC_PAGES = [
  "/",
  "/home",
  "/about",
  "/contact",
];

const ROLE_HOME = {
  admin: "/admin/dashboard",
  store: "/store/dashboard",
  user: "/home",
};

const ProtectedRoute = memo(({ children, allowedRoles = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hasCheckedAuth = useRef(false);

  const { authenticate, role, status } = useSelector((state) => state.auth);

  /* ---------- AUTH CHECK (ONCE) ---------- */
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    dispatch(getAuthorize()).then((res) => {
      if (res?.payload?.role) {
        dispatch(getUserProfile());
      }
    });
  }, [dispatch]);

  /* ---------- NAVIGATION LOGIC ---------- */
  useEffect(() => {
    if (status === "idle" || status === "checking") return;

    const path = location.pathname;
    const isAuthPage = AUTH_PAGES.includes(path);
    const isPublicPage = PUBLIC_PAGES.includes(path);
    const isAdminPath = path.startsWith("/admin");
    const home = ROLE_HOME[role];

    // Admin users must stay inside admin routes
    if (authenticate && role === "admin" && !isAdminPath && !isAuthPage) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    // Handle public pages
    if (isPublicPage) {
      // Admins cannot access public pages
      if (authenticate && role === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
      // Everyone else (logged in users/stores and non-logged-in users) can access
      return;
    }

    // Not logged in and not on auth page or public page
    if (!authenticate && !isAuthPage && !isPublicPage) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    // Logged in but on auth page
    if (authenticate && isAuthPage && home && !path.startsWith(home)) {
      navigate(home, { replace: true });
      return;
    }

    // Logged in but role not allowed
    if (
      authenticate &&
      allowedRoles.length > 0 &&
      role &&
      !allowedRoles.includes(role) &&
      home &&
      !path.startsWith(home)
    ) {
      navigate(home, { replace: true });
    }
  }, [status, authenticate, role, allowedRoles, navigate, location]);

  /* ---------- LOADING ---------- */
  if (status === "idle" || status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  return children;
});

export default ProtectedRoute;
