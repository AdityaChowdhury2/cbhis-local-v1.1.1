import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import Loader from "./components/core/loader/Loader";
import ErrorBoundaryFallback from "./components/error-boundary/ErrorBoundaryFallback";
import Routes from "./routers/ApplicationRouter";
import useAuthCheck from "./hooks/authentication/useAuthenticationCheck";

const router = createBrowserRouter([
  {
    children: Routes,
    errorElement: <ErrorBoundaryFallback />,
  },
]);

function App() {
  // check if user is authenticated
  const isAuthChecked = useAuthCheck();

  return isAuthChecked ? <RouterProvider router={router} /> : <Loader />;
}

export default App;
