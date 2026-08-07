import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCurrentWorkspace } from "../features/workspace/workspaceSlice";

function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { workspaces, currentWorkspace } = useSelector(
    (state) => state.workspace
  );

  const handleChange = (e) => {
    const workspace = workspaces.find(
      (w) => w._id === e.target.value
    );

    if (workspace) {
      dispatch(setCurrentWorkspace(workspace));
      navigate(`/workspaces/${workspace._id}`);
    }
  };

  console.log(workspaces);
 console.log(currentWorkspace);

  return (
    <div className="relative flex items-center w-full max-w-xs antialiased">
      {/* Active Workspace Badge Icon */}
      <div className="absolute left-2.5 z-10 pointer-events-none flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs border border-indigo-500/30">
        {currentWorkspace?.name ? currentWorkspace.name.charAt(0).toUpperCase() : "W"}
      </div>

      {/* Styled Native Select */}
      <select
        value={currentWorkspace?._id || ""}
        onChange={handleChange}
        className="w-full text-xs font-medium bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-xl pl-10 pr-8 py-2 hover:bg-zinc-800/80 hover:border-zinc-700/80 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 cursor-pointer appearance-none shadow-sm shadow-black/40"
      >
        {workspaces.map((workspace) => (
          <option
            key={workspace._id}
            value={workspace._id}
            className="bg-zinc-900 text-zinc-200 py-1.5"
          >
            {workspace.name}
          </option>
        ))}
      </select>

      {/* Custom Dropdown Chevron */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px]">
        ▼
      </span>
    </div>
  );
}

export default WorkspaceSwitcher;