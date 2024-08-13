import { lazy } from "react";
const ErrorBoundaryFallback = lazy(
  () => import("@/components/error-boundary/ErrorBoundaryFallback")
);
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Routes from "./ApplicationRouter";

const router = createBrowserRouter([
  {
    children: Routes,
    errorElement: <ErrorBoundaryFallback />,
  },
]);

const LoadRouter = () => {
  return <RouterProvider router={router} />;
};

export default LoadRouter;
