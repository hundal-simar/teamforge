import {
  useState,
} from "react";

import WorkspaceSwitcher
from "./WorkspaceSwitcher";

import CreateWorkspaceModal
from "./CreateWorkspaceModal";

function Navbar() {

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  return (
    <nav>

      <h2>
        TeamForge
      </h2>

      <WorkspaceSwitcher />

      <button
        onClick={() =>
          setShowModal(true)
        }
      >
        Create Workspace
      </button>

      {showModal && (
        <CreateWorkspaceModal
          onClose={() =>
            setShowModal(false)
          }
        />
      )}

    </nav>
  );
}

export default Navbar;