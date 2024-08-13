// const SignIn = lazy(() => import("@/pages/home/user-signin/SignIn"));

import ForgotPassword from "@/pages/forgot-password/ForgotPassword";
import SignIn from "@/pages/user-signin/SignIn";

// routes for public pages
const PublicRoutes = [
  {
    path: "/",
    element: <SignIn />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
];

export default PublicRoutes;
