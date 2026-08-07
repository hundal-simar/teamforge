import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Workspace from "../pages/Workspace";
import Project from "../pages/Project";
import JoinWorkspace from "../pages/JoinWorkspace";
import BoardPage from "../pages/BoardPage";
import ProfilePage from "../pages/ProfilePage";
import DashboardPage from "../pages/DashboardPage";
import WorkspaceSettingsPage from "../pages/WorkspaceSettingsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../components/AppLayout";

const router = createBrowserRouter([
  
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/join/:token",
    element: <JoinWorkspace />,
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/workspaces/:workspaceId", element: <Workspace /> },
          { path: "/workspaces/:workspaceId/projects", element: <Project /> },
          { path: "/workspaces/:workspaceId/settings", element: <WorkspaceSettingsPage /> },
          { path: "/projects/:projectId", element: <BoardPage /> },
          { path: "/profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
]);

export default router;