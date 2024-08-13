import Loader from "@/components/core/loader/Loader";
import ErrorBoundary from "@/components/error-boundary/ErrorBoundary";
import ErrorBoundaryFallback from "@/components/error-boundary/ErrorBoundaryFallback";
import useAuthentication from "@/hooks/authentication/useAuthentication";
import { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * @description if user is logged he can't public routes
 * @param props.children
 */
function PublicGuard() {
  // login status
  const isLoggedIn = useAuthentication();

  // public route
  return !isLoggedIn ? (
    <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  ) : (
    <Navigate to={"/dashboard"} />
  );
}

// export public route
export default PublicGuard;
