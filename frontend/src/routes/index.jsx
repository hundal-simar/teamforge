import {createBrowserRouter} from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Workspace from "../pages/Workspace";
import Project from "../pages/Project";

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
]);

export default router;