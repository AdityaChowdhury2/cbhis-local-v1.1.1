import RootLayout from "@/layout/RootLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import TaskAssignments from "@/pages/task-assignments/TaskAssignments";
import UsersList from "@/pages/users/index/Index";
import { URLDashboard, URLTaskAssignments, URLUsers } from "./routes-link";
import SettingsRoutes from "./settings-router";

// import DeviceIntermittence from "@/pages/device-intermittence/DeviceIntermittence";

const PrivateRoutes = [
  {
    element: <RootLayout />,
    children: [
      ...SettingsRoutes,
      {
        path: URLDashboard(),
        element: <Dashboard />,
      },
      {
        path: URLTaskAssignments(),
        element: <TaskAssignments />,
      },
      {
        path: URLUsers(),
        element: <UsersList />,
      },
    ],
  },
];

export default PrivateRoutes;
