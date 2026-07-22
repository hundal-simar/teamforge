import {createBrowserRouter} from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Workspace from "../pages/Workspace";
import Project from "../pages/Project";
import JoinWorkspace from "../pages/JoinWorkspace";

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
    path: "/workspaces/:workspaceId",
    element: <Workspace />,
  },
  {
    path: "/projects/:projectId",
    element: <Project />,
  },
  {
    path: "/join/:token",
    element : <JoinWorkspace/>
  },
]);

export default router;