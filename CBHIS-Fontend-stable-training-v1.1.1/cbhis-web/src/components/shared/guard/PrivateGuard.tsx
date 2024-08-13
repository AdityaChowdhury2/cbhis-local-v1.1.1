import Loader from "@/components/core/loader/Loader";
import ErrorBoundary from "@/components/error-boundary/ErrorBoundary";
import ErrorBoundaryFallback from "@/components/error-boundary/ErrorBoundaryFallback";
import useAuthentication from "@/hooks/authentication/useAuthentication";
import { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * @description PrivateGuard component
 */
function PrivateGuard() {
  // check if user is logged in
  const isLoggedIn = useAuthentication();

  // protected route
  return isLoggedIn ? (
    <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  ) : (
    <Navigate to="/" />
  );
}

// export private route
export default PrivateGuard;
