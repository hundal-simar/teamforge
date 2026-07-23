import {createBrowserRouter} from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Workspace from "../pages/Workspace";
import Project from "../pages/Project";
import JoinWorkspace from "../pages/JoinWorkspace";
import BoardPage from "../pages/BoardPage";

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
    path: "/workspaces/:workspaceId/projects",
    element: <Project />,
  },
  {
    path: "/join/:token",
    element : <JoinWorkspace/>
  },
  {
    path: "/projects/:projectId",
    element : <BoardPage/>
  },
]);

export default router;