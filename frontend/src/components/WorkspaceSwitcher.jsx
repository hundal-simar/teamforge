

import {
  useSelector,
  useDispatch,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  setCurrentWorkspace,
} from "../features/workspace/workspaceSlice";

function WorkspaceSwitcher() {

  const navigate =
    useNavigate();

  const dispatch =
    useDispatch();

  const {
    workspaces,
    currentWorkspace,
  } = useSelector(
    (state) =>
      state.workspace
  );

  const handleChange =
    (e) => {

      const workspace =
        workspaces.find(
          (w) =>
            w._id ===
            e.target.value
        );

      dispatch(
        setCurrentWorkspace(
          workspace
        )
      );

      navigate(
        `/workspaces/${workspace._id}`
      );
    };

  return (
    <select
      value={
        currentWorkspace?._id ||
        ""
      }
      onChange={handleChange}
    >
      {workspaces.map(
        (workspace) => (
          <option
            key={
              workspace._id
            }
            value={
              workspace._id
            }
          >
            {workspace.name}
          </option>
        )
      )}
    </select>
  );
}

export default WorkspaceSwitcher;