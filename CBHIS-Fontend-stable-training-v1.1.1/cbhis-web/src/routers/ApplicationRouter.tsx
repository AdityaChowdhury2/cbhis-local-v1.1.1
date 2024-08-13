import { lazy } from "react";
import PrivateRoutes from "./PrivateRoutes";
import PublicRoutes from "./PublicRoutes";
import PrivateGuard from "@/components/shared/guard/PrivateGuard";
import PublicGuard from "@/components/shared/guard/PublicGuard";
const PageNotFound = lazy(() => import("@/components/not-found/PageNotFound"));

const Routes = [
  {
    element: <PrivateGuard />,
    children: PrivateRoutes,
  },
  {
    element: <PublicGuard />,
    children: PublicRoutes,
  },
  // ...PublicRoutes,
  // ...PrivateRoutes,
  {
    path: "*",
    element: <PageNotFound />,
  },
];

export default Routes;
